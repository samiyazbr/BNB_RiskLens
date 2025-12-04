// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HoneypotToken
 * @dev A token demonstrating HIGH RISK honeypot characteristics
 * @notice DANGER: This token contains honeypot patterns:
 * - Blocks transfers from non-owner addresses after initial distribution
 * - Allows buys but prevents sells (classic honeypot)
 * - Hidden transfer restrictions
 * - For educational/testing purposes ONLY
 */
contract HoneypotToken {
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
    
    // Honeypot control variables
    bool public tradingEnabled = false;
    mapping(address => bool) public isWhitelisted;
    
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
        
        // Owner is whitelisted by default
        isWhitelisted[msg.sender] = true;
        
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
        
        emit Mint(_to, _value);
        emit Transfer(address(0), _to, _value);
    }
    
    /**
     * @dev HONEYPOT: Transfer tokens with hidden restrictions
     * @notice Only owner and whitelisted addresses can transfer when trading is disabled
     * @param _to Recipient address
     * @param _value Amount to transfer
     * @return success Whether the transfer succeeded
     */
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid recipient");
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        
        // HONEYPOT PATTERN: Hidden transfer restriction
        // Most users won't be able to sell after buying
        if (!tradingEnabled) {
            require(isWhitelisted[msg.sender], "Trading not enabled");
        }
        
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
        
        allowance[msg.sender][_spender] = _value;
        
        emit Approval(msg.sender, _spender, _value);
        return true;
    }
    
    /**
     * @dev HONEYPOT: Transfer tokens on behalf of another address with restrictions
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
        
        // HONEYPOT PATTERN: Hidden transfer restriction
        if (!tradingEnabled) {
            require(isWhitelisted[_from], "Trading not enabled");
        }
        
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
     * @dev HONEYPOT CONTROL: Enable trading for everyone (owner only)
     * @notice Owner can enable trading, but typically won't in a honeypot scenario
     */
    function enableTrading() public onlyOwner {
        tradingEnabled = true;
    }
    
    /**
     * @dev HONEYPOT CONTROL: Add address to whitelist (owner only)
     * @param _address Address to whitelist
     */
    function whitelist(address _address) public onlyOwner {
        isWhitelisted[_address] = true;
    }
    
    /**
     * @dev HONEYPOT CONTROL: Remove address from whitelist (owner only)
     * @param _address Address to remove from whitelist
     */
    function removeFromWhitelist(address _address) public onlyOwner {
        isWhitelisted[_address] = false;
    }
}
