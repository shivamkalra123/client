import React, { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";

// Replace with your deployed contract address and ABI
const CONTRACT_ADDRESS = "0x8204a605C76c6684bB26C083FeaA616D579536E2";
const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string[]",
        name: "candidateNames",
        type: "string[]",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "candidate",
        type: "string",
      },
    ],
    name: "totalVotesFor",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "candidate",
        type: "string",
      },
    ],
    name: "voteForCandidate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const App = () => {
  const [voterAddress, setVoterAddress] = useState("");
  const [votes, setVotes] = useState({});
  const [candidates] = useState(["Alice", "Bob", "Charlie"]);

  useEffect(() => {
    const connectWallet = async () => {
      try {
        if (!window.ethereum) {
          alert(
            "MetaMask is not installed. Please install it to use this app."
          );
          return;
        }

        const provider = new BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setVoterAddress(address);

        // Fetch votes after connecting
        getVotes();
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert("Error connecting to MetaMask. Please try again.");
      }
    };

    connectWallet();
  }, []);

  const voteForCandidate = async (candidate) => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.voteForCandidate(candidate);
      await tx.wait();
      alert(`You voted for ${candidate}`);
      getVotes(); // Refresh votes after voting
    } catch (error) {
      console.error("Error voting:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  const getVotes = async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const newVotes = {};
      for (const candidate of candidates) {
        const voteCount = await contract.totalVotesFor(candidate);
        newVotes[candidate] = voteCount.toString(); // Convert BigInt to string
      }
      setVotes(newVotes);
    } catch (error) {
      console.error("Error fetching votes:", error);
      alert("Error fetching votes. Please refresh the page.");
    }
  };

  return (
    <div>
      <h1>Voting dApp</h1>
      <p>Your Address: {voterAddress || "Not connected"}</p>
      <div>
        {candidates.map((candidate) => (
          <div key={candidate}>
            <p>
              {candidate} - {votes[candidate] || 0} votes
            </p>
            <button onClick={() => voteForCandidate(candidate)}>
              Vote for {candidate}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
