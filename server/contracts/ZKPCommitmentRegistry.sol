// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ZKPCommitmentRegistry {
    
    struct CommitmentData {
        string commitment;      
        string email;          
        string publicKey;     
        uint256 timestamp;     
        bool isActive;        
    }
    
    // Mapping from user address to their commitment data
    mapping(address => CommitmentData) public commitments;
    
    // Mapping from email hash to user address
    mapping(bytes32 => address) public emailToAddress;
    
    // Events
    event CommitmentRegistered(
        address indexed user,
        bytes32 indexed emailHash,
        string commitment,
        uint256 timestamp
    );
    
    event CommitmentUpdated(
        address indexed user,
        string newCommitment,
        uint256 timestamp
    );
    
    event CommitmentDeactivated(
        address indexed user,
        uint256 timestamp
    );
    

    function registerCommitment(
        string memory _commitment,
        string memory _email,
        string memory _publicKey
    ) external {
        bytes32 emailHash = keccak256(abi.encodePacked(_email));
        
        // Check if email is already registered
        require(
            emailToAddress[emailHash] == address(0),
            "Email already registered"
        );
        
        // Store commitment data using email hash as key instead of msg.sender
        // This allows one wallet to register multiple users
        address commitmentAddress = address(uint160(uint256(emailHash)));
        
        commitments[commitmentAddress] = CommitmentData({
            commitment: _commitment,
            email: _email,
            publicKey: _publicKey,
            timestamp: block.timestamp,
            isActive: true
        });
        
        emailToAddress[emailHash] = commitmentAddress;
        
        emit CommitmentRegistered(commitmentAddress, emailHash, _commitment, block.timestamp);
    }
    

    function updateCommitment(string memory _newCommitment) external {
        require(
            commitments[msg.sender].isActive,
            "No active commitment found"
        );
        
        commitments[msg.sender].commitment = _newCommitment;
        commitments[msg.sender].timestamp = block.timestamp;
        
        emit CommitmentUpdated(msg.sender, _newCommitment, block.timestamp);
    }
    

    function deactivateCommitment() external {
        require(
            commitments[msg.sender].isActive,
            "No active commitment found"
        );
        
        commitments[msg.sender].isActive = false;
        
        // Clean up the email-to-address mapping to prevent dangling references
        bytes32 emailHash = keccak256(abi.encodePacked(commitments[msg.sender].email));
        emailToAddress[emailHash] = address(0);
        
        emit CommitmentDeactivated(msg.sender, block.timestamp);
    }
    
    function getCommitment(address _user) 
        external 
        view 
        returns (
            string memory commitment,
            string memory email,
            string memory publicKey,
            uint256 timestamp,
            bool isActive
        ) 
    {
        CommitmentData memory data = commitments[_user];
        return (
            data.commitment,
            data.email,
            data.publicKey,
            data.timestamp,
            data.isActive
        );
    }
    
  
    function getAddressByEmail(string memory _email) 
        external 
        view 
        returns (address) 
    {
        bytes32 emailHash = keccak256(abi.encodePacked(_email));
        return emailToAddress[emailHash];
    }

    function isCommitmentActive(address _user) 
        external 
        view 
        returns (bool) 
    {
        return commitments[_user].isActive;
    }
}
