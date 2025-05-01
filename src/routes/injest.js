const express   = require('express');
const multer    = require('multer');
const unzipper  = require('unzipper');
const crypto    = require('crypto');
const fs        = require('fs-extra');
const path      = require('path');

const SIP      = require('../models/SIP');
const Resource = require('../models/Resource');

const router = express.Router();
const upload = multer({ dest: 'tmp_sips/' });  // pasta temporária

router.post('/ingest', upload.single('sip'), async (req, res, next) => {
  const zipPath = req.file.path;
  const tempDir = zipPath + '_dir';

  try {
    // 1. Descomprimir o ZIP
    await fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    // 2. Verificar e parsear manifesto
    const manifestPath = path.join(tempDir, 'manifesto-SIP.json');
    if (!await fs.pathExists(manifestPath)) {
      throw new Error('manifesto-SIP.json não encontrado');
    }
    const { version, payload } = await fs.readJSON(manifestPath);

    // 3. Criar documento SIP
    const sipDoc = await SIP.create({
      version,
      submittedAt: new Date(),
      originalFilename: req.file.originalname
    });

    // 4. Processar cada item do payload
    const resourcesCreated = [];
    for (const item of payload) {
      // 4.1 Validar ficheiro principal
      const itemFilePath = path.join(tempDir, item.filename);
      if (!await fs.pathExists(itemFilePath)) {
        throw new Error(`Ficheiro ${item.filename} em falta`);
      }

      // 4.2 Calcular checksum SHA-256
      const hash = crypto.createHash('sha256');
      await new Promise((resolve) => {
        fs.createReadStream(itemFilePath)
          .on('data', data => hash.update(data))
          .on('end', () => resolve());
      });
      const checksum = hash.digest('hex');
      if (checksum !== item.checksum) {
        throw new Error(`Checksum inválido para ${item.filename}`);
      }

      // 4.3 Ler e parsear o JSON de metadados
      const metadataSrcPath = path.join(tempDir, item.metadata);
      if (!await fs.pathExists(metadataSrcPath)) {
        throw new Error(`Metadata JSON ${item.metadata} em falta`);
      }
      const metadataObj = await fs.readJSON(metadataSrcPath);

      // 4.4 Determinar categoria e criar diretórios
      const tipoCat = metadataObj.tipo; // ex: "Imagens", "Documentos", etc.
      const baseDir    = path.join('uploads', tipoCat);
      const metaDir    = path.join(baseDir, 'metadata');
      await fs.ensureDir(baseDir);
      await fs.ensureDir(metaDir);

      // 4.5 Mover ficheiro principal
      const destFilePath = path.join(baseDir, path.basename(item.filename));
      await fs.move(itemFilePath, destFilePath, { overwrite: true });

      // 4.6 Mover ficheiro de metadados
      const destMetaPath = path.join(metaDir, path.basename(item.metadata));
      await fs.move(metadataSrcPath, destMetaPath, { overwrite: true });

      // 4.7 Criar documento Resource
      const resourceDoc = await Resource.create({
        sip:       sipDoc._id,
        filename:  item.filename,
        checksum,
        metadata:  metadataObj,
        path:      destFilePath,
      });

      resourcesCreated.push(resourceDoc);
    }

    // 5. Limpar ficheiros temporários
    await fs.remove(zipPath);
    await fs.remove(tempDir);

    // 6. Responder com sucesso
    res.status(201).json({
      message:        'Ingestão completa',
      sipId:          sipDoc._id,
      resourcesCount: resourcesCreated.length
    });
  }
  catch (err) {
    // Limpar temporários em caso de erro
    await fs.remove(zipPath).catch(() => {});
    await fs.remove(tempDir).catch(() => {});
    next(err);
  }
});

module.exports = router;
