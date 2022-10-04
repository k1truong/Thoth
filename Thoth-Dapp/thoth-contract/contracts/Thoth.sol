//SPDX-License-Identifier: UNLICENSED
//1=Hospital, 2=Manufactuerer, 3=Insurance, 4=Doctor, 5=Patient

pragma solidity >=0.4.22 <=0.6.0;

contract Thoth{
    
    mapping (address=>uint) memberType; 
    mapping (address=>uint) balance;
    
    //States
    enum Phase {Idle, Requesting, Sending, Accept, Deny}  

    struct record{ 
        Phase state;
        mapping(address=>Phase) whocansee;
    }
    
    mapping (address=>record) recordInfo;

    struct Equipment { 
        address location;
        Phase state;
        bytes32 fee;
    }
    
    mapping (address=>Equipment) equipInfo;

    event RequestMade();
    event ResponseGiven();
    event RequestEnded();


    modifier onlyMember{ 
        require(memberType[msg.sender]!=0);
        _;
    }
    modifier onlyHospiandManufactuerer{ 
        require(memberType[msg.sender]==1 || memberType[msg.sender]==2);
        _;
    }
    modifier onlyDoctorandInsurance{ 
        require(memberType[msg.sender]==3 || memberType[msg.sender]==4);
        _;
    }
    modifier onlyPatient{ 
        require(memberType[msg.sender]==5);
        _;
    }
    
    
    constructor() public {
        
    }
    
    function register (uint whatType) public payable{ 
        
        memberType[msg.sender] =whatType; 
        balance[msg.sender] =msg.value;
        
        //Manufactuerer
        if(whatType == 2){
            equipInfo[msg.sender].location = msg.sender;
            equipInfo[msg.sender].state = Phase.Idle;
        }
        
        //Patient
        if(whatType == 5){
            recordInfo[msg.sender].state = Phase.Idle;
        }
        
    }
    
    function unregister (address member) public { 
        memberType[member]=0;
    }
    
    //A request changes the state in the owner's struct, 
    //payment is also sent to struct to see what they will pay, no transaction happens yet
    function requestEquipment(address toMember, uint payment, bytes32 password) onlyHospiandManufactuerer public { 
            
        if(memberType[toMember] != 1 && memberType[toMember] != 2){
            revert();
        }
    
        equipInfo[toMember].state = Phase.Requesting;
        equipInfo[toMember].fee = keccak256(abi.encodePacked(bytes32(payment), password));
        
        emit RequestMade();
    }
    
    //A 0 response means deny, a 1 means they will send the item
    function respondToEquipment(address toMember, uint response) onlyHospiandManufactuerer public { 
            
        if(memberType[toMember] != 1 && memberType[toMember] != 2){
            revert();
        }
    
        if(response == 1){
             equipInfo[msg.sender].state = Phase.Sending;
        }
        else{
            equipInfo[msg.sender].state = Phase.Idle;
        }
        
        emit ResponseGiven();
    }
    
    //A formal closure of the transaction
    function endRequest(address toMember) onlyMember public{
        
         if(memberType[toMember] == 5){
            
             recordInfo[toMember].state = Phase.Idle;
         }
         else if(memberType[toMember] == 2){
            equipInfo[toMember].state = Phase.Idle;
         }
        
        emit RequestEnded();
    }
    
    //Requester must pay what they offered
    function feeTransaction(address payable toAddress, uint amount, bytes32 password) onlyMember public payable{
        
        Equipment storage owner = equipInfo[toAddress];
        
        if (owner.fee == keccak256(abi.encodePacked(bytes32(amount), password))){
            
              balance[toAddress] = balance[toAddress] + msg.value;
              balance[msg.sender] = balance[msg.sender] - msg.value;
              toAddress.transfer(msg.value);
        }
        
    }
    
    //Updates where the equipment is
    function reportLocation(address currentlocation) onlyHospiandManufactuerer public {
        
        if(memberType[currentlocation] != 1 && memberType[currentlocation] != 2 ){
            revert();
        }
        
        equipInfo[msg.sender].location = currentlocation;
    }
    
    //Can see who has the equipment
    function viewLocation(address owner) onlyHospiandManufactuerer public view returns(address thelocation){
        
        if(memberType[owner] != 1 && memberType[owner] != 2 ){
            revert();
        }
        
        thelocation = equipInfo[owner].location;
    }
    
    //Request access to record
    function requestRecord(address toMember) onlyDoctorandInsurance public  { 
            
        if(memberType[toMember] != 3 && memberType[toMember] != 5){
            revert();
        }
        
        recordInfo[toMember].state = Phase.Requesting;
    }
    
    //Response 1 is accept, 0 is deny
    function respondToRecord(address toMember, uint response) onlyMember public { 
            
        if(memberType[toMember] != 3 && memberType[toMember] != 4){
            revert();
        }
        
        if(response == 1){
            recordInfo[msg.sender].state = Phase.Sending;
        }
        else{
            recordInfo[msg.sender].state = Phase.Idle;
        }

    }
    
    //Show if they can see a specific patient's record
    function viewRecord(address patient)  public view returns(bool canAccess){
        
        canAccess = false;
        
        if(memberType[msg.sender] != 3 && memberType[msg.sender] != 4  && memberType[msg.sender] != 5){
            revert();
        }
        
        if(memberType[patient] != 5){
            revert();
        }
        
        if(recordInfo[patient].whocansee[msg.sender] == Phase.Accept){
             canAccess = true;
        }
        
    }
    
    //Patient can add a doctor to see their record
    function approve(address doctorID) onlyPatient public {
         if(memberType[doctorID] != 4){
            revert();
        }
        
        recordInfo[msg.sender].whocansee[doctorID] = Phase.Accept;
    }
    
    //Patient can also remove doctor from seeing record
    function remove(address doctorID) onlyPatient public {
        
        if(memberType[doctorID] != 4){
            revert();
        }
        
        recordInfo[msg.sender].whocansee[doctorID] = Phase.Deny;
    }
}