const express = require('express');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const bcrypt = require('bcryptjs');
const {sequelize} = require('./db/connection');
const {User} = require('./db/models/user');
const {QrResult} = require('./db/models/qr_results');
const Jimp = require('jimp');
const QRCodeReader = require('qrcode-reader');
const fs = require('fs');
const session = require('express-session');

const app = express();

app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

function ensureAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.redirect('/login');
}

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('User model was synchronized successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


app.get('/', ensureAuthenticated, async (req, res) => {
    console.log('mySession', req.session)
    res.status(200).render('index.hbs')
})

app.get('/login', async (req, res) => {
    res.status(200).render('login.hbs')
})

app.get('/signup', async (req, res) => {
    res.status(200).render('signup.hbs')
})

app.get('/history', ensureAuthenticated, async (req, res) => {
    try {
        const {user} = req.session;

        const history = await QrResult.findAll({
            where: {
                user_id: user.id
            }
        })

        const resultArray = history.map(el => {

            return {
                username: user.username,
                result: el.result,
                date: el.date,
            }
        })

        res.status(200).render('history.hbs', {history: resultArray});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/upload', ensureAuthenticated, upload.single('file'), async (req, res) => {
    if (req.file) {
        const {user} = req.session;
        // Read and decode the QR code
        Jimp.read(req.file.path, async (err, image) => {
          if (err) {
            return res.status(500).send('Error reading image');
          }
    
          const qr = new QRCodeReader();
    
          qr.callback = async (err, value) => {
            if (err) {
              return res.status(500).send('Error decoding QR code');
            }
    
            // Delete the uploaded file after processing
            fs.unlink(req.file.path, (err) => {
              if (err) {
                console.error('Error deleting uploaded file:', err);
              }
            });

            const newQR = await QrResult.create({result: value.result, user_id: user.id, date: new Date().toISOString() })
    
            res.status(200).render('index.hbs', {result: value.result})
          };
    
          qr.decode(image.bitmap);
        });
      } else {
        res.status(400).send('No file uploaded');
      }
});

app.post('/signup', async (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await User.create({
            username: username,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;

        const existUser = await User.findOne({where: {username}})

        if(!existUser) {
            throw new Error('User with this username not found!')
        }

        const unhashedPassword = await bcrypt.compare(password, existUser.password);

        if(!unhashedPassword) {
            throw new Error('Password in not equal!')
        }

        req.session.user = {
            id: existUser.id,
            username: existUser.username,
            password: existUser.password,
        }

        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post('/logout', async (req, res) => {
    try {
        req.session.destroy();
        
        res.redirect('/');
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
