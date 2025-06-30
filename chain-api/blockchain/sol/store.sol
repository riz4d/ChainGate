pragma solidity ^0.8.0;

contract store {
    // Event for critical log storage
    event LogStored(uint256 indexed timestamp, string logData, string severity, string source);
    
    // Structure to represent a critical log
    struct CriticalLog {
        uint256 timestamp;
        string logData;
        string severity;
        string source;
    }
    
    // Array to store all critical logs
    CriticalLog[] public criticalLogs;
    
    // Latest log hash (for verification)
    bytes32 public latestLogHash;
    
    // Total number of logs stored
    uint256 public logCount;
    
    // Store a critical log
    function storeLog(uint256 timestamp, string memory logData, string memory severity, string memory source) public {
        // Create new log entry
        CriticalLog memory newLog = CriticalLog({
            timestamp: timestamp,
            logData: logData,
            severity: severity,
            source: source
        });
        
        // Add to storage
        criticalLogs.push(newLog);
        
        // Update log count
        logCount++;
        
        // Calculate hash of this log entry (for verification)
        latestLogHash = keccak256(abi.encodePacked(timestamp, logData, severity, source));
        
        // Emit event
        emit LogStored(timestamp, logData, severity, source);
    }
    
    // Get the latest log
    function getLatestLog() public view returns (uint256, string memory, string memory, string memory) {
        require(logCount > 0, "No logs stored yet");
        CriticalLog memory latestLog = criticalLogs[logCount - 1];
        return (latestLog.timestamp, latestLog.logData, latestLog.severity, latestLog.source);
    }
    
    // Get a specific log by index
    function getLog(uint256 index) public view returns (uint256, string memory, string memory, string memory) {
        require(index < logCount, "Log index out of bounds");
        CriticalLog memory log = criticalLogs[index];
        return (log.timestamp, log.logData, log.severity, log.source);
    }
    
    // Get total number of logs
    function getLogCount() public view returns (uint256) {
        return logCount;
    }
    
    // Legacy functions (keep for backward compatibility)
    uint public storedData;
    
    function set(uint x) public {
        storedData = x;
    }
    
    function get() public view returns (uint) {
        return storedData;
    }
}
