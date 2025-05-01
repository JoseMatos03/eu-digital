const unzipper = require("unzipper");
const crypto = require("crypto");
const fs = require("fs-extra");
const path = require("path");

const logger = require("../utils/logger");
const SIP = require("../models/SIP");
const Resource = require("../models/Resource");

exports.handleIngest = async (req, res, next) => {
  const zipPath = req.file.path;
  const tempDir = zipPath + "_dir";

  try {
    logger.info(`Upload SIP em curso: ${req.file.originalname}`);

    // 1. Descomprimir o ZIP
    await fs
      .createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    // 2. Verificar e parsear manifesto
    const manifestPath = path.join(tempDir, "manifesto-SIP.json");
    if (!(await fs.pathExists(manifestPath))) {
      logger.error(`Manifesto JSON não encontrado`);
      throw new Error("manifesto-SIP.json não encontrado");
    }
    const { version, payload } = await fs.readJSON(manifestPath);
    logger.info(
      `Versão do Manifesto: ${version}, Ficheiros: ${payload.length}`
    );

    // 3. Criar documento SIP
    const sipDoc = await SIP.create({
      version,
      submittedAt: new Date(),
      originalFilename: req.file.originalname,
    });

    const resourcesCreated = [];

    for (const item of payload) {
      const itemFilePath = path.join(tempDir, item.filename);
      if (!(await fs.pathExists(itemFilePath))) {
        logger.error(`Ficheiro em falta: ${item.filename}`);
        throw new Error(`Ficheiro ${item.filename} em falta`);
      }

      const hash = crypto.createHash("sha256");
      await new Promise((resolve) => {
        fs.createReadStream(itemFilePath)
          .on("data", (data) => hash.update(data))
          .on("end", () => resolve());
      });
      const checksum = hash.digest("hex");
      if (checksum !== item.checksum) {
        logger.error(`Checksum inválido para ${item.filename}`);
        throw new Error(`Checksum inválido para ${item.filename}`);
      }

      const metadataSrcPath = path.join(tempDir, item.metadata);
      if (!(await fs.pathExists(metadataSrcPath))) {
        logger.error(`Metadata JSON ${item.metadata} em falta`);
        throw new Error(`Metadata JSON ${item.metadata} em falta`);
      }
      const metadataObj = await fs.readJSON(metadataSrcPath);

      const tipoCat = metadataObj.tipo;
      const baseDir = path.join("uploads", tipoCat);
      const metaDir = path.join(baseDir, "metadata");
      await fs.ensureDir(baseDir);
      await fs.ensureDir(metaDir);

      const destFilePath = path.join(baseDir, path.basename(item.filename));
      const destMetaPath = path.join(metaDir, path.basename(item.metadata));
      await fs.move(itemFilePath, destFilePath, { overwrite: true });
      await fs.move(metadataSrcPath, destMetaPath, { overwrite: true });

      const resourceDoc = await Resource.create({
        sip: sipDoc._id,
        filename: item.filename,
        checksum,
        metadata: metadataObj,
        path: destFilePath,
        tipo: tipoCat,
      });

      resourcesCreated.push(resourceDoc);
      logger.info(`Recurso criado: ${item.filename} em ${tipoCat}`);
    }

    await fs.remove(zipPath);
    await fs.remove(tempDir);

    logger.info(`Entrada SIP criada na BD: ${sipDoc._id}`);
    res.status(201).json({
      message: "Ingestão completa",
      sipId: sipDoc._id,
      resourcesCount: resourcesCreated.length,
    });
  } catch (err) {
    await fs.remove(zipPath).catch(() => {});
    await fs.remove(tempDir).catch(() => {});
    next(err);
  }
};
