App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  //url: "",
  address:'0xc2cd3Df9fa1f8a64625DBb36af4276944E3cd1e3',
  chairPerson: null,
  currentAccount: null,
  eRequests: {},


  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // Is there is an injected web3 instance?
    if (typeof web3 !== "undefined") {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);
    ethereum.enable();

    App.contracts.Thoth = web3.eth.contract(App.abi).at(App.address);
    return App.initContract();
  },

  initContract: function () {
    $.getJSON("Thoth.json", function (data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var voteArtifact = data;
      App.contracts.vote = TruffleContract(voteArtifact);
      App.contracts.mycontract = data;
      // Set the provider for our contract
      //App.populateAddress();
      App.contracts.vote.setProvider(App.web3Provider);
      return App.bindEvents();
    });
  },

  bindEvents: function () {
    $(document).on("click", "#Register", App.handleRegister);
    $(document).on("click", "#UnRegister", App.handleUnregister);
    $(document).on("click", "#equipmentRequestButton", App.handleEquipReq);
    $(document).on("click", "#equipmentResponseButton", App.handleEquipRes);
    $(document).on("click", "#endButton", App.handleEnd);
    $(document).on("click", "#feeButton", App.handleFee);
    $(document).on("click", "#reportButton", App.handleReport);
    $(document).on("click", "#viewButton", App.handleView);
    $(document).on("click", "#recordRequestButton", App.handleRecReq);
    $(document).on("click", "#recordresponsebutton", App.handleRecRes);
    $(document).on("click", "#viewRecordButton", App.handleViewRecord);
    $(document).on("click", "#approveButton", App.handleApprove);
    $(document).on("click", "#removeButton", App.handleRemove);
  },

  getChairperson: function () {
    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance;
      })
      .then(function (result) {
        App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
        App.currentAccount = web3.eth.coinbase;
      });
  },

  //Populate Account Addresses for reference
  populateAddress: function () {
    new Web3(new Web3.providers.HttpProvider(App.url)).eth.getAccounts(
      (err, accounts) => {
        $("#acc1addr").text(accounts[0]);
        $("#acc2addr").text(accounts[1]);
        $("#acc3addr").text(accounts[2]);
        $("#acc4addr").text(accounts[3]);
        $("#acc5addr").text(accounts[4]);
        $("#acc6addr").text(accounts[5]);
        $("#acc7addr").text(accounts[6]);
        $("#acc8addr").text(accounts[7]);
      }
    );
  },

  handleRegister: function (event) {
    var deposit = 0;
    var membertype = $("#RegisterType").val();
    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.register(membertype, { value: web3.toWei(deposit, "ether")});
      })
      .then(function (result) {
        //console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Registration successful", 4);
          App.logMember(membertype);
        } else {
          App.showNotification("Error during registration", 5);
        }
      })
      .catch(function (err) {
        //console.log(err);
        App.showNotification("Error during registration", 5);
      });
  },

  handleUnregister: function (event) {
    var memberAddress = $("#UnRegAddress").val();
    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.unregister(memberAddress);
      })
      .then(function (result) {
        console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Unregistration Successful", 4);
        } else {
          App.showNotification("Error during unregistration", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during unregistration", 5);
      });
  },


  handleEquipReq: function (event) {

    var reqAddress = $("#equipReq").val();
    var pay = $("#paymentOffer").val();
    var pass = $("#passwordID").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.requestEquipment(reqAddress,pay,pass);
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.logRequest(web3.eth.coinbase,reqAddress);
          App.showNotification("Equipment Request Sent", 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  handleEquipRes: function (event) {

    var resAddress = $("#equipResponseAddressId").val();
    var response = $("#equipResponseId").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.respondToEquipment(resAddress,response);
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Equipment Response Sent", 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  handleEnd: function (event) {

    var member = $("#endAddressId").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.endRequest(member);
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Request Ended", 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },


  handleFee: function (event) {
    var toAddress = $("#feetoAddress").val();
    var amount = $("#feePayID").val();
    var pass = $("#feePassID").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.feeTransaction(toAddress, amount, pass,{ value: web3.toWei(amount, "ether")});
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Fee successful", 4);
        } else {
          App.showNotification("Error during transaction", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during transaction", 5);
      });
  },

  handleReport: function (event) {

    var member = $("#reportlocationID").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.reportLocation(member);
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Report successful", 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  handleView: function (event) {

    var owner = $("#viewAddressID").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.viewLocation(owner);
      })
      .then(function (result) {
        //console.log(result);
        if (result) {
          App.showNotification("Currently held by:" + result, 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  handleRecReq: function (event) {

    var member = $("#recordReq").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.requestRecord(member);
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Record Request Sent", 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  handleRecRes: function (event) {

    var member = $("#recordReplyAddress").val();
    var response = $("#recordResonse").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.respondToRecord(member,response);
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Record Response Sent", 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  handleViewRecord: function (event) {

    var patient = $("#canViewRecordAddress").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.viewRecord(patient);
      })
      .then(function (result) {        
        App.showNotification("Patient approved: " + result, 4);
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  handleApprove: function (event) {

    var doc = $("#approveDocID").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.approve(doc);
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Approve successful", 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  handleRemove: function (event) {

    var doc = $("#removeDocID").val();

    App.contracts.vote
      .deployed()
      .then(function (instance) {
        return instance.remove(doc);
      })
      .then(function (result) {
        // console.log(result);
        if (result && parseInt(result.receipt.status) == 1) {
          App.showNotification("Remove successful", 4);
        } else {
          App.showNotification("Error during request", 5);
        }
      })
      .catch(function (err) {
        console.log(err);
        App.showNotification("Error during request", 5);
      });
  },

  logRequest: function (fromAddress, toAddress) {
    $.post(
      "/log",
      {
        fromAddress: fromAddress,
        toAddress: toAddress,
      },
      function (data, status) {
        if (status == "success") {
        }
      }
    );    
  },

  logMember: function (type) {
    $.post(
      "/member",
      {
        address: web3.eth.coinbase,
        type: type,
      },
      function (data, status) {
        if (status == "success") {
        }
      }
    );    
  },
  

  showNotification: function (text, type) {
    toastr.info(text, "", {
      iconClass: "toast-info notification" + String(type),
    });
  },

  abi:[
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "RequestEnded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "RequestMade",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "ResponseGiven",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "doctorID",
          "type": "address"
        }
      ],
      "name": "approve",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "toMember",
          "type": "address"
        }
      ],
      "name": "endRequest",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address payable",
          "name": "toAddress",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "password",
          "type": "bytes32"
        }
      ],
      "name": "feeTransaction",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "whatType",
          "type": "uint256"
        }
      ],
      "name": "register",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "doctorID",
          "type": "address"
        }
      ],
      "name": "remove",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "currentlocation",
          "type": "address"
        }
      ],
      "name": "reportLocation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "toMember",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "payment",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "password",
          "type": "bytes32"
        }
      ],
      "name": "requestEquipment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "toMember",
          "type": "address"
        }
      ],
      "name": "requestRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "toMember",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "response",
          "type": "uint256"
        }
      ],
      "name": "respondToEquipment",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "toMember",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "response",
          "type": "uint256"
        }
      ],
      "name": "respondToRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "member",
          "type": "address"
        }
      ],
      "name": "unregister",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "viewLocation",
      "outputs": [
        {
          "internalType": "address",
          "name": "thelocation",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "patient",
          "type": "address"
        }
      ],
      "name": "viewRecord",
      "outputs": [
        {
          "internalType": "bool",
          "name": "canAccess",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

};



$(function () {
  $(window).load(function () {
    App.init();
    //Notification UI config
    toastr.options = {
      showDuration: "1000",
      positionClass: "toast-top-left",
      preventDuplicates: true,
      closeButton: true,
    };
  });
});
