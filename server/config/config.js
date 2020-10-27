//================
//Puerto
//================
process.env.PORT = process.env.PORT || 3000;


//==================
//Entorno
//==================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

//==================
//Vencimiento Token
//=================
//30 días
process.env.CADUCIDAD_TOKEN = '30d';

//==================
//Seed
//==================
process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';



//================
//Base de datos
//================
let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb+srv://ramon:bG5xvxjbE0k1xmrH@cluster0.iwh16.mongodb.net/cafe'
}
process.env.URLDB = urlDB;