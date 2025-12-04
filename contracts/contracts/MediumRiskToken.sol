// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MediumRiskToken
 * @dev A token demonstrating MEDIUM RISK characteristics
 * @notice Risk patterns in this contract:
 * - Low activity (simulated by low holder count)
 * - Few holders
 * - Potentially low liquidity
 * - Still follows standard ERC20 but lacks market maturity
 */
contract MediumRiskToken {
    // Token metadata
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    
    // Account balances
    mapping(address => uint256) public balanceOf;
    
    // Allowances for token spending
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Track unique holders
    address[] public holders;
    mapping(address => bool) public isHolder;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 value);
    event Burn(address indexed from, uint256 value);
    
    // Contract owner
    address public owner;
    
    // Creation timestamp for "new contract" risk detection
    uint256 public immutable creationTime;
    
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
        creationTime = block.timestamp;
        
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
     * @dev Internal mint function
     * @param _to Address to receive minted tokens
     * @param _value Amount to mint
     */
    function _mint(address _to, uint256 _value) internal {
        totalSupply += _value;
        balanceOf[_to] += _value;
        
        // Track holder
        if (!isHolder[_to] && _value > 0) {
            holders.push(_to);
            isHolder[_to] = true;
        }
        
        emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
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
        
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        
        // Track new holder
        if (!isHolder[_to] && _value > 0) {
            holders.push(_to);
            isHolder[_to] = true;
        }
        
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
        
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        
        // Track new holder
        if (!isHolder[_to] && _value > 0) {
            holders.push(_to);
            isHolder[_to] = true;
        }
        
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
        _mint(_to, _value);
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
    
    /**
     * @dev Get total number of unique holders
     * @return Number of holders
     */
    function getHolderCount() public view returns (uint256) {
        return holders.length;
    }
    
    /**
     * @dev Get contract age in days
     * @return Age in days
     */
    function getContractAgeInDays() public view returns (uint256) {
        return (block.timestamp - creationTime) / 1 days;
    }
}
