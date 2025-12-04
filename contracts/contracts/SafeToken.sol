// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SafeToken
 * @dev A safe, standard ERC20 token with verified behavior
 * @notice This token demonstrates LOW RISK characteristics:
 * - Verified contract code
 * - Standard ERC20 implementation
 * - No honeypot patterns
 * - Transparent transfer logic
 */
contract SafeToken {
    // Token metadata
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    
    // Account balances
    mapping(address => uint256) public balanceOf;
    
    // Allowances for token spending
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    
    // Contract owner
    address public owner;
    
    /**
     * @dev Constructor initializes the token
     * @param _name Token name
     * @param _symbol Token symbol
     * @param _initialSupply Initial token supply (in tokens, not wei)
     */
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        
        // Mint initial supply to contract creator
        _mint(msg.sender, _initialSupply * 10**decimals);
    }
    
    /**
     * @dev Modifier to restrict functions to owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }
    
    /**
     * @dev Transfer tokens from sender to recipient
     * @param _to Recipient address
     * @param _value Amount to transfer
     * @return success Whether the transfer succeeded
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid recipient");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        // Standard transfer logic - SAFE, no honeypot tricks
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
    
    /**
     * @dev Approve spender to spend tokens on behalf of sender
     * @param _spender Address authorized to spend
     * @param _value Amount authorized
     * @return success Whether the approval succeeded
     */
    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "Invalid spender");
        
        // Standard approval - NO unlimited approval tricks
        allowance[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    /**
     * @dev Transfer tokens on behalf of another address
     * @param _from Address to transfer from
     * @param _to Address to transfer to
     * @param _value Amount to transfer
     * @return success Whether the transfer succeeded
     */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_from != address(0), "Invalid sender");
        require(_to != address(0), "Invalid recipient");
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Insufficient allowance");
        
        // Standard transferFrom logic - SAFE
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        emit Transfer(_from, _to, _value);
        return true;
    }
    
    /**
     * @dev Mint new tokens (owner only)
     * @param _to Address to receive minted tokens
     * @param _value Amount to mint
     */
    function mint(address _to, uint256 _value) public onlyOwner {
        require(_to != address(0), "Invalid recipient");
        
        totalSupply += _value;
        balanceOf[_to] += _value;
        
        emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
    }
    
    /**
     * @dev Burn tokens from sender's balance
     * @param _value Amount to burn
     */
    function burn(uint256 _value) public {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        balanceOf[msg.sender] -= _value;
        totalSupply -= _value;
        
        emit Burn(msg.sender, _value);
        emit Transfer(msg.sender, address(0), _value);
    }
}
