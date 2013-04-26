var Q = require('q')
, auth = require('./auth')
, transactions = module.exports = {}

transactions.configure = function(app, conn, securityId) {
    app.get('/accounts/transactions', transactions.forUser.bind(transactions, conn))
    app.get('/accounts/:id/transactions', transactions.forUserAccount.bind(transactions, conn))
}

transactions.forUser = function(conn, req, res, next) {
    if (!auth.demand(req, res)) return

    var query = [
        'SELECT transaction_id, user_id, created, amount_decimal amount, security_id',
        'FROM account_transaction',
        'WHERE user_id = $1',
        'ORDER BY transaction_id DESC'
    ].join('\n')

    Q.ninvoke(conn, 'query', {
        text: query,
        values: [req.security.userId]
    })
    .then(function(dres) {
        res.send(dres.rows)
    }, next)
    .done()
}

transactions.forUserAccount = function(conn, req, res, next) {
    if (!auth.demand(req, res)) return

    var query = 'SELECT * FROM account_transaction ' +
        'WHERE account_id = $1 AND user_id = $2'
    Q.ninvoke(conn, 'query', {
        text: query,
        values: [req.params.id, req.security.userId]
    })
    .then(function(dres) {
        res.send(dres.rows)
    }, next)
    .done()
}
