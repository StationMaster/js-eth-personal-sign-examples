var ethUtil = require('ethereumjs-util')
var sigUtil = require('eth-sig-util')
var Eth = require('ethjs')
window.Eth = Eth
console.log('new V2')
var fs = require('fs')
var terms = fs.readFileSync(__dirname + '/terms.txt').toString()
window.web3Proxy = wan3


// const Web3 = require('Wan3')
// const web3 = new Web3(new Web3.providers.HttpProvider('https://mywanwallet.nl/testnet'));

function isInstalled() {
  if (typeof wan3 !== 'undefined') {
    console.log('WanMask is installed')
    isLocked()
  }
  else {
    console.log('WanMask is not installed')
  }
}

function isLocked() {
  wan3.eth.getAccounts(function (err, accounts) {
    if (err != null) {
      console.log(err)
    }
    else if (accounts.length === 0) {
      console.log('WanMask is locked')
    }
    else {
      console.log('WanMask is not locked')
      checkBalance();
    }
  });
}

function checkBalance() {
  wan3.eth.getBalance(
    wan3.eth.accounts[0],
    function (err, result) {
      if (err != null) {
        console.log(err)
      }
      console.log('Balance: ' + result.c[0])
    });
}

connectButton.addEventListener('click', function () {
  console.log('web3', web3)
  console.log('wan3', wan3)
  console.log('window', window)
  console.log('window.web3', window.web3)
  console.log('window.wan3', window.wan3)
  isInstalled()
  connect()
})

function connect() {
  if (typeof ethereum !== 'undefined') {
    ethereum.enable()
      .catch(console.error)
  }
}

ethSignButton.addEventListener('click', function (event) {
  event.preventDefault()
  var msg = '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0'
  var from = window.web3Proxy.eth.accounts[0]
  if (!from) return connect()
  window.web3Proxy.eth.sign(from, msg, function (err, result) {
    if (err) return console.error(err)
    console.log('SIGNED:' + result)
  })
})

personalSignButton.addEventListener('click', function (event) {
  event.preventDefault()
  var text = terms
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  // var msg = '0x1' // hexEncode(text)
  console.log(msg)
  var from = window.web3Proxy.eth.accounts[0]
  if (!from) return connect()

  /*  web3.personal.sign not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.personal.sign(msg, from) function (err, result) {
      if (err) return console.error(err)
      console.log('PERSONAL SIGNED:' + result)
    })
  */

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msg, from]
  var method = 'personal_sign'

  window.web3Proxy.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.error(err)
    if (result.error) return console.error(result.error)
    console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))

    console.log('recovering...')
    const msgParams = { data: msg }
    msgParams.sig = result.result
    console.dir({ msgParams })
    const recovered = sigUtil.recoverPersonalSignature(msgParams)
    console.dir({ recovered })

    if (recovered === from) {
      console.log('SigUtil Successfully verified signer as ' + from)
      window.alert('SigUtil Successfully verified signer as ' + from)
    } else {
      console.dir(recovered)
      console.log('SigUtil Failed to verify signer when comparing ' + recovered.result + ' to ' + from)
      console.log('Failed, comparing %s to %s', recovered, from)
    }


    /*
    method = 'personal_ecRecover'
    var params = [msg, result.result]
    web3.currentProvider.sendAsync({
      method,
      params,
      from,
    }, function (err, recovered) {
      console.dir({ err, recovered })
      if (err) return console.error(err)
      if (result.error) return console.error(result.error)

      if (result.result === from ) {
        console.log('Successfully verified signer as ' + from)
      } else {
        console.log('Failed to verify signer when comparing ' + result.result + ' to ' + from)
      }

    })
    */
  })

})


personalRecoverTest.addEventListener('click', function (event) {
  event.preventDefault()
  var text = 'hello!'
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  // var msg = '0x1' // hexEncode(text)
  console.log(msg)
  var from = window.web3Proxy.eth.accounts[0]
  if (!from) return connect()

  /*  web3.personal.sign not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.personal.sign(msg, from) function (err, result) {
      if (err) return console.error(err)
      console.log('PERSONAL SIGNED:' + result)
    })
  */

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msg, from]
  var method = 'personal_sign'

  window.web3Proxy.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.error(err)
    if (result.error) return console.error(result.error)
    console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))

    console.log('recovering...')
    const msgParams = { data: msg }
    msgParams.sig = result.result

    method = 'personal_ecRecover'
    var params = [msg, result.result]
    window.web3Proxy.currentProvider.sendAsync({
      method,
      params,
      from,
    }, function (err, result) {
      var recovered = result.result
      console.log('ec recover called back:')
      console.dir({ err, recovered })
      if (err) return console.error(err)
      if (result.error) return console.error(result.error)


      if (recovered === from) {
        console.log('Successfully ecRecovered signer as ' + from)
      } else {
        console.log('Failed to verify signer when comparing ' + result + ' to ' + from)
      }

    })
  })

})

ethjsPersonalSignButton.addEventListener('click', function (event) {
  event.preventDefault()
  var text = terms
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  var from = window.web3Proxy.eth.accounts[0]
  if (!from) return connect()

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [from, msg]

  // Now with Eth.js
  var eth = new Eth(window.web3Proxy.currentProvider)

  eth.personal_sign(msg, from)
    .then((signed) => {
      console.log('Signed!  Result is: ', signed)
      console.log('Recovering...')

      return eth.personal_ecRecover(msg, signed)
    })
    .then((recovered) => {

      if (recovered === from) {
        console.log('Ethjs recovered the message signer!')
      } else {
        console.log('Ethjs failed to recover the message signer!')
        console.dir({ recovered })
      }
    })
})


signTypedDataButton.addEventListener('click', function (event) {
  event.preventDefault()

  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, Alice!'
    },
    {
      type: 'uint32',
      name: 'A number',
      value: '1337'
    }
  ]

  var from = wan3.eth.accounts[0]
  if (!from) return connect()

  /*  web3.eth.signTypedData not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.eth.signTypedData(msg, from) function (err, result) {
      if (err) return console.error(err)
      console.log('PERSONAL SIGNED:' + result)
    })
  */

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msgParams, from]
  console.dir(params)
  var method = 'eth_signTypedData'

  window.web3Proxy.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.dir(err)
    if (result.error) {
      alert(result.error.message)
    }
    if (result.error) return console.error(result)
    console.log('PERSONAL SIGNED:' + JSON.stringify(result.result))

    const recovered = sigUtil.recoverTypedSignatureLegacy({ data: msgParams, sig: result.result })

    if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
      alert('Successfully ecRecovered signer as ' + from)
    } else {
      alert('Failed to verify signer when comparing ' + result + ' to ' + from)
    }

  })

})

signTypedDataV3Button.addEventListener('click', function (event) {
  event.preventDefault()

  window.web3Proxy.currentProvider.sendAsync({
    method: 'net_version',
    params: [],
    jsonrpc: "2.0"
  }, function (err, result) {
    const netId = result.result
    console.log('netId', netId)
    const msgParams = JSON.stringify({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" }
        ],
        Person: [
          { name: "name", type: "string" },
          { name: "wallet", type: "address" }
        ],
        Mail: [
          { name: "from", type: "Person" },
          { name: "to", type: "Person" },
          { name: "contents", type: "string" }
        ]
      },
      primaryType: "Mail",
      domain: { name: "Mail", version: "1", chainId: netId, verifyingContract: "0xbe5d4d46bd33362f66cb0e6a24c81565ecb565c4" },
      message: {
        from: { name: "Cow", wallet: "0xca4014a8189be6caa489cc3c8375682ad4037389" },
        to: { name: "Bob", wallet: "0xccc60b77bba332329e44ee982deb8ddb21bfcabc" },
        contents: "Hello, Bob!"
      }
    })



    var from = window.web3Proxy.eth.accounts[0]

    console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
    var params = [from, msgParams]
    console.dir(params)
    var method = 'eth_signTypedData_v3'
    console.log('eth_signTypedData_v3')

    window.web3Proxy.currentProvider.sendAsync({
      method,
      params,
      from,
    }, function (err, result) {
      console.log('result', result)
      if (err) return console.dir(err)
      if (result.error) {
        alert(result.error.message)
      }
      if (result.error) return console.error('ERROR', result)
      console.log('TYPED SIGNED:' + JSON.stringify(result.result))

      const recovered = sigUtil.recoverTypedSignature({ data: JSON.parse(msgParams), sig: result.result })

      if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
        alert('Successfully ecRecovered signer as ' + from)
      } else {
        alert('Failed to verify signer when comparing ' + result + ' to ' + from)
      }

    })

  })

})

ethjsSignTypedDataButton.addEventListener('click', function (event) {
  event.preventDefault()

  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, Alice!'
    },
    {
      type: 'uint32',
      name: 'A number',
      value: '1337'
    }
  ]

  var from = window.web3Proxy.eth.accounts[0]
  if (!from) return connect()

  console.log('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msgParams, from]

  var eth = new Eth(window.web3Proxy.currentProvider)

  eth.signTypedData(msgParams, from)
    .then((signed) => {
      console.log('Signed!  Result is: ', signed)
      console.log('Recovering...')

      const recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: signed })

      if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
        alert('Successfully ecRecovered signer as ' + from)
      } else {
        alert('Failed to verify signer when comparing ' + signed + ' to ' + from)
      }

    })
})
