const request = require('supertest');
const fs      = require('fs-extra');
const path    = require('path');
const archiver = require('archiver');
const mongoose = require('mongoose');

const app = require('../app');

// utilitário para gerar um SIP ZIP em memória
async function makeTestZip(outPath) {
  await fs.ensureDir(path.dirname(outPath));
  const output = fs.createWriteStream(outPath);
  const archive = archiver('zip');
  archive.pipe(output);

  // ficheiro de exemplo
  const imgSrc = path.join(__dirname, 'fixtures', 'tralalero.png');
  const meta   = {
    version: '0.97',
    payload: [
      {
        filename: 'foto.jpg',
        metadata: 'metadata/foto.json',
        checksum: await fs.readFile(imgSrc).then(buf =>
          require('crypto').createHash('sha256').update(buf).digest('hex')
        )
      }
    ]
  };

  archive.append(JSON.stringify(meta, null,2), { name: 'manifesto-SIP.json' });
  archive.file(imgSrc, { name: 'foto.jpg' });
  archive.append(JSON.stringify({
    dataCriacao: '2025-01-01T00:00:00Z',
    dataSubmissao: new Date().toISOString(),
    produtor: 'Test',
    publicador: 'Test',
    titulo: 'Foto Teste',
    tipo: 'Imagem',
    tags: ['Pessoal/Fotografia']
  }), { name: 'metadata/foto.json' });

  await archive.finalize();
}

describe('POST /api/ingest', () => {
  const zipPath = path.join(__dirname, 'tmp', 'test-sip.zip');

  beforeAll(async () => {
    await makeTestZip(zipPath);
  });

  it('deve processar o SIP e devolver 201 + sipId', async () => {
    const res = await request(app)
      .post('/api/ingest')
      .attach('sip', zipPath);

    console.log('DEBUG:', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.sipId).toBeDefined();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
