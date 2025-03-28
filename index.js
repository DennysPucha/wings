const express = require("express");
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const app = express();
app.use(cors({ origin: '*' })); 
const port = process.env.PORT || 3000;
app.use('/totos', usersRouter);
app.get("/", (req, res) => {
  const htmlResponse = `
    <html>
      <head>
        <title>NodeJs y Express en Vercel</title>
      </head>
      <body>
        <h1>Soy un proyecto Back end en vercel</h1>
      </body>
    </html>
  `;
  res.send(htmlResponse);
});

app.listen(port, () => {
  console.log(`port runing in http://localhost:${port}`);
}); 
   