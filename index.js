const express = require('express');
const db = require('./database');

const app = express();
app.use(express.json());

const angkaValid = v => Number.isInteger(v) && v >= 0;

app.get('/api/barang', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT kode, nama, harga, stock FROM barang ORDER BY kode');
    res.json(rows);
  } catch (err) { res.sendStatus(500); }
});

app.get('/api/barang/:kode', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT kode, nama, harga, stock FROM barang WHERE kode=?', [req.params.kode]
    );
    if (!rows.length) return res.status(404).json({ pesan: 'Produk tidak ditemukan' });
    res.json(rows[0]);
  } catch (err) { res.sendStatus(500); }
});

app.post('/api/barang', async (req, res) => {
  const { kode, nama, harga, stock } = req.body;
  if (!kode || !nama || !angkaValid(harga) || !angkaValid(stock)) {
    return res.status(400).json({ pesan: 'Data tidak valid' });
  }
  try {
    await db.execute(
      'INSERT INTO barang (kode, nama, harga, stock) VALUES (?,?,?,?)',
      [kode, nama, harga, stock]
    );
    res.status(201).json({ pesan: 'Data ditambahkan' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ pesan: 'Kode produk sudah ada' });
    res.sendStatus(500);
  }
});

app.put('/api/barang/:kode', async (req, res) => {
  const { nama, harga, stock } = req.body;
  const kolom = [];
  const nilai = [];
  if (nama !== undefined) {
    if (!String(nama).trim()) return res.status(400).json({ pesan: 'Nama tidak boleh kosong' });
    kolom.push('nama=?'); nilai.push(String(nama).trim());
  }
  if (harga !== undefined) {
    if (!angkaValid(harga)) return res.status(400).json({ pesan: 'Harga tidak valid' });
    kolom.push('harga=?'); nilai.push(harga);
  }
  if (stock !== undefined) {
    if (!angkaValid(stock)) return res.status(400).json({ pesan: 'Stock tidak valid' });
    kolom.push('stock=?'); nilai.push(stock);
  }
  if (!kolom.length) return res.status(400).json({ pesan: 'Tidak ada data yang diubah' });

  try {
    const [hasil] = await db.execute(
      `UPDATE barang SET ${kolom.join(', ')} WHERE kode=?`, [...nilai, req.params.kode]
    );
    if (!hasil.affectedRows) return res.status(404).json({ pesan: 'Produk tidak ditemukan' });
    res.json({ pesan: 'Data diperbarui' });
  } catch (err) { res.sendStatus(500); }
});

app.delete('/api/barang/:kode', async (req, res) => {
  try {
    const [hasil] = await db.execute('DELETE FROM barang WHERE kode=?', [req.params.kode]);
    if (!hasil.affectedRows) return res.status(404).json({ pesan: 'Produk tidak ditemukan' });
    res.json({ pesan: 'Data dihapus' });
  } catch (err) { res.sendStatus(500); }
});

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/index.html', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/beli.html', (req, res) => res.sendFile(__dirname + '/beli.html'));

app.listen(3000, () => console.log('http://localhost:3000'));