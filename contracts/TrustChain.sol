// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrustChainRegistry
 * @dev A smart contract to register and verify credentials on the blockchain.
 */
contract TrustChainRegistry {
    address public owner;

    // Struct to hold certificate data on-chain
    struct Certificate {
        string documentHash;
        address issuer;
        uint256 timestamp;
        bool isValid;
    }

    // Mapping from documentHash -> Certificate
    mapping(string => Certificate) private certificates;

    event CertificateIssued(string indexed documentHash, address indexed issuer, uint256 timestamp);
    event CertificateRevoked(string indexed documentHash, address indexed revoker, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Issue a new certificate by securely storing its hash and the issuer's wallet address.
     * @param _documentHash The SHA-256 hash of the certificate document.
     */
    function issueCertificate(string memory _documentHash) public {
        require(!certificates[_documentHash].isValid, "Certificate hash already exists");

        certificates[_documentHash] = Certificate({
            documentHash: _documentHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isValid: true
        });

        emit CertificateIssued(_documentHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Verify a certificate by passing its hash. Returns the issuer address and timestamp if valid.
     * @param _documentHash The SHA-256 hash of the certificate document.
     */
    function verifyCertificate(string memory _documentHash) public view returns (bool isValid, address issuer, uint256 timestamp) {
        Certificate memory cert = certificates[_documentHash];
        return (cert.isValid, cert.issuer, cert.timestamp);
    }

    /**
     * @dev Revokes a previously issued certificate. Only the original issuer can revoke it.
     * @param _documentHash The hash of the certificate to revoke.
     */
    function revokeCertificate(string memory _documentHash) public {
        require(certificates[_documentHash].isValid, "Certificate does not exist or is already revoked");
        require(certificates[_documentHash].issuer == msg.sender, "Only the issuer can revoke this certificate");

        certificates[_documentHash].isValid = false;
        
        emit CertificateRevoked(_documentHash, msg.sender, block.timestamp);
    }
}
