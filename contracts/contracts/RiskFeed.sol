// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RiskFeed
 * @dev Public risk reporting contract for BNB Chain tokens
 * @notice Allows users to publish token risk assessments on-chain
 * - Transparent and immutable risk data
 * - Community-driven risk reporting
 * - Event-based feed for easy indexing
 * - Minimal storage for efficiency
 */
contract RiskFeed {
    // Risk level enumeration
    enum RiskLevel { LOW, MEDIUM, HIGH }
    
    // Risk report structure
    struct RiskReport {
        address token;          // Token address being evaluated
        uint256 score;          // Risk score (0-10 scale)
        RiskLevel level;        // Risk level derived from score
        uint256 timestamp;      // When the report was published
        address reporter;       // Who published the report
        string rulesTriggered;  // Comma-separated rule IDs that triggered
    }
    
    // Events
    event RiskPublished(
        address indexed token,
        uint256 score,
        RiskLevel level,
        uint256 timestamp,
        address indexed reporter,
        string rulesTriggered
    );
    
    event RiskUpdated(
        address indexed token,
        uint256 oldScore,
        uint256 newScore,
        RiskLevel newLevel,
        address indexed reporter
    );
    
    // Storage: mapping of token address to latest risk report
    // Note: Using minimal storage - only latest report per token
    mapping(address => RiskReport) public latestRiskReport;
    
    // Track all tokens that have been reported
    address[] public reportedTokens;
    mapping(address => bool) public hasBeenReported;
    
    // Total number of reports published
    uint256 public totalReports;
    
    /**
     * @dev Publish a risk assessment for a token
     * @param _token Address of the token being evaluated
     * @param _score Risk score (0-10 scale)
     * @param _rulesTriggered Comma-separated string of rule IDs (e.g., "R1,R3,R5")
     */
    function publishRisk(
        address _token,
        uint256 _score,
        string memory _rulesTriggered
    ) public {
        require(_token != address(0), "Invalid token address");
        require(_score <= 10, "Score must be 0-10");
        
        // Derive risk level from score
        RiskLevel level;
        if (_score <= 2) {
            level = RiskLevel.LOW;
        } else if (_score <= 4) {
            level = RiskLevel.MEDIUM;
        } else {
            level = RiskLevel.HIGH;
        }
        
        // Check if this is an update or new report
        bool isUpdate = hasBeenReported[_token];
        uint256 oldScore = 0;
        
        if (isUpdate) {
            oldScore = latestRiskReport[_token].score;
        } else {
            // First report for this token
            reportedTokens.push(_token);
            hasBeenReported[_token] = true;
        }
        
        // Create and store the report
        RiskReport memory report = RiskReport({
            token: _token,
            score: _score,
            level: level,
            timestamp: block.timestamp,
            reporter: msg.sender,
            rulesTriggered: _rulesTriggered
        });
        
        latestRiskReport[_token] = report;
        totalReports++;
        
        // Emit appropriate event
        if (isUpdate) {
            emit RiskUpdated(_token, oldScore, _score, level, msg.sender);
        }
        
        emit RiskPublished(
            _token,
            _score,
            level,
            block.timestamp,
            msg.sender,
            _rulesTriggered
        );
    }
    
    /**
     * @dev Get the latest risk report for a token
     * @param _token Token address
     * @return report The latest risk report
     */
    function getRiskReport(address _token) public view returns (RiskReport memory) {
        require(hasBeenReported[_token], "Token not yet reported");
        return latestRiskReport[_token];
    }
    
    /**
     * @dev Get total number of unique tokens reported
     * @return count Number of unique tokens
     */
    function getReportedTokenCount() public view returns (uint256) {
        return reportedTokens.length;
    }
    
    /**
     * @dev Get a reported token address by index
     * @param _index Index in the reportedTokens array
     * @return token Token address
     */
    function getReportedToken(uint256 _index) public view returns (address) {
        require(_index < reportedTokens.length, "Index out of bounds");
        return reportedTokens[_index];
    }
    
    /**
     * @dev Check if a token has been reported
     * @param _token Token address
     * @return reported Whether the token has been reported
     */
    function isTokenReported(address _token) public view returns (bool) {
        return hasBeenReported[_token];
    }
    
    /**
     * @dev Get risk level as string
     * @param _level RiskLevel enum value
     * @return levelString Risk level as string
     */
    function getRiskLevelString(RiskLevel _level) public pure returns (string memory) {
        if (_level == RiskLevel.LOW) return "LOW";
        if (_level == RiskLevel.MEDIUM) return "MEDIUM";
        return "HIGH";
    }
}
