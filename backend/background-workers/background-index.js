import express from 'express';


const app = express();

app.get('/', (req, res) => {
    res.send('Background worker is running!');
});

app.listen(3000, () => {
    console.log('Background worker is listening on port 3000');
});

