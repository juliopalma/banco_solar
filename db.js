const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'bancosolar',
    password: '1234',
    max: 8,
    min: 2,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 2000
});

async function consultar() {
    let client
    client = await pool.connect();
    let res = await client.query({ text: `select * from usuarios` });
    client.release();
    return res.rows;
};

async function insertar_usuario(nombre, balance) {
    let client
    client = await pool.connect();

    let res = await client.query({
        text: `insert into usuarios (nombre, balance) values($1, $2)`,
        values: [nombre, parseInt(balance)]
    });

    client.release();
    return res.rows;
};

async function transferencias() {
    let client
    client = await pool.connect();
    let res = await client.query({ text: `select * from transferencias` });
    client.release();
    return res.rows;
};


async function realizar_transferencia(nombre_emisor, nombre_receptor, monto) {

    const client = await pool.connect();
    let { rows } = await client.query({
        text: 'select * from usuarios where nombre=$1',
        values: [nombre_emisor]
    });
    const emisor = rows[0];

    result = await client.query({
        text: 'select * from usuarios where nombre=$1',
        values: [nombre_receptor]
    });
    const receptor = result.rows[0];

    const monto_usuario = parseInt(monto);

    if (emisor.balance < monto_usuario) {
        throw "No tiene saldo suficiente para realizar la transferencia";
    }

    const resultado1 = emisor.balance - monto_usuario;
    await client.query({
        text: 'update usuarios set balance=$1 where id=$2',
        values: [resultado1, emisor.id]
    });

    const resultado2 = receptor.balance + monto_usuario;
    await client.query({
        text: 'update usuarios set balance=$1 where id=$2',
        values: [resultado2, receptor.id]
    });

    await client.query({
        text: 'insert into transferencias (emisor, receptor, monto) values (resultado1, resultado2, monto_usuario'
    });

}




async function eliminar_usuario(id_usuario) {
    let client
    client = await pool.connect();
    let res = await client.query({ text: `delete from usuarios where id = $1`, values: [id_usuario] });
    return res.rows;
};

async function actualizar_usuario(nombre_usuario, balance_usuario, id_usuario) {
    let client
    client = await pool.connect();

    let res = await client.query({ text: `update usuarios set nombre = $1, balance = $2 where id = $3`, values: [nombre_usuario, balance_usuario, id_usuario] })

    client.release();
    return res.rows;
};

module.exports = { consultar, transferencias, insertar_usuario, realizar_transferencia, eliminar_usuario, actualizar_usuario }