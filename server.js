const express = require('express');
const cors = require('cors');
const app = express();
const { Pool, types } = require('pg');
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'irfando123',
  port: 5432,
});

function getRandomNumber() {
  return Math.floor(Math.random() * 100) + 1; // Menghasilkan bilangan acak antara 1 dan 100
}

function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

function fibonacci(n) {
  const fib = [0, 1];
  for (let i = 2; i <= n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  return fib[n];
}

app.use(express.json());
app.use(cors());

  
app.post('/capture', async (req, res) => {
    const { name, nickname, type } = req.body;
    const captured_at = new Date().toISOString(); // Mengambil waktu saat ini dalam format ISO untuk captured_at
  
    try {
      const query = 'INSERT INTO captured_pokemon ("name", nickname, captured_at, type) VALUES ($1, $2, $3, $4)';
      await pool.query(query, [name, nickname, captured_at, type]);
      res.status(200).send('Pokémon berhasil ditangkap.');
    } catch (error) {s
      console.error('Gagal menyimpan Pokémon yang ditangkap:', error);
      res.status(500).send('Gagal menyimpan Pokémon yang ditangkap.');
    }
  });
  


  app.delete('/release/:id', async (req, res) => {
    const { id } = req.params;
    const releaseNumber = getRandomNumber();
  
    try {
      if (isPrime(releaseNumber)) {
        await pool.query('DELETE FROM captured_pokemon WHERE id = $1', [id]);
        res.status(200).json({ releaseNumber, message: 'Pokémon berhasil dilepaskan.' });
      } else {
        res.status(200).json({ releaseNumber, message: 'Bilangan yang dikembalikan bukan bilangan prima, pelepasan gagal.' });
      }
    } catch (error) {
      res.status(500).send('Gagal melepaskan Pokémon.');
    }
  });



  const generateFibonacciNickname = (currentNickname) => {
    // Base name if currentNickname is empty
    const baseName = currentNickname ? currentNickname.split('-')[0] : 'Mighty Pikachu';
  
    // Function to calculate Fibonacci number
    const fibonacci = (n) => {
      if (n <= 0) return 0;
      if (n === 1) return 1;
      let a = 0, b = 1;
      for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
      }
      return b;
    };
  
    // Extract the number part from the current nickname
    const parts = currentNickname ? currentNickname.split('-') : [];
  
    // Determine the next Fibonacci number
    const lastNum = parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : -1; // Get the last number after the last dash
    const nextFibNum = fibonacci(lastNum + 1);
  
    return `${baseName}-${nextFibNum}`;
  };
  
  // Endpoint untuk mengganti nama Pokémon berdasarkan aturan deret Fibonacci
  app.put('/rename/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Fetch the current nickname from captured_pokemon table
      const result = await pool.query('SELECT nickname FROM captured_pokemon WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).send('Pokémon not found.');
      }
  
      const { nickname } = result.rows[0];
  
      const newNickname = generateFibonacciNickname(nickname);
  
      // Update the nickname in the database
      await pool.query('UPDATE captured_pokemon SET nickname = $1 WHERE id = $2', [newNickname, id]);
  
      res.status(200).json({ message: 'Pokémon berhasil diganti nama.', newName: newNickname });
    } catch (error) {
      console.error('Error renaming Pokémon:', error);
      res.status(500).send('Gagal mengganti nama Pokémon.');
    }
  });
  





  


app.get('/myPokemonList', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM captured_pokemon');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Gagal mendapatkan data:', error);
      res.status(500).send('Gagal mendapatkan data.');
    }
});


// app.post('/rename', async (req, res) => {
//   const { name, newName } = req.body;
//   try {
//     await pool.query('INSERT INTO renamed_pokemon (name, new_name) VALUES ($1, $2)', [name, newName]);
//     res.status(200).send('Pokémon berhasil diubah namanya.');
//   } catch (error) {
//     res.status(500).send('Gagal mengubah nama Pokémon.');
//   }
// });

app.listen(5000, () => {
  console.log('Server berjalan pada port 5000');
});
