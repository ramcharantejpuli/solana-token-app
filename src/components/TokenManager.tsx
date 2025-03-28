import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey, LAMPORTS_PER_SOL, Transaction, Keypair, Signer, TransactionInstruction } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, createMintToInstruction, createTransferInstruction } from '@solana/spl-token';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid as MuiGrid,
  Snackbar,
  Alert,
} from '@mui/material';

const Grid = MuiGrid as any; // Type assertion to fix Grid component issues

const TokenManager: React.FC = () => {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [mint, setMint] = useState<PublicKey | null>(null);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const updateBalance = useCallback(async () => {
    if (publicKey) {
      try {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error getting balance:', error);
      }
    }
  }, [publicKey, connection]);

  useEffect(() => {
    if (publicKey) {
      updateBalance();
      // Set up interval for real-time updates
      const intervalId = setInterval(updateBalance, 5000);
      return () => clearInterval(intervalId);
    }
  }, [publicKey, updateBalance]);

  const handleCreateToken = async () => {
    try {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected!');
      }

      const mintKeypair = Keypair.generate();
      const transaction = new Transaction();
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      const mint = await createMint(
        connection,
        {
          publicKey: publicKey,
          secretKey: new Uint8Array(32)
        },
        publicKey,
        publicKey,
        9,
        mintKeypair,
        undefined,
        TOKEN_PROGRAM_ID
      );

      setMint(mint);
      await updateBalance();
      setNotification({
        open: true,
        message: 'Token created successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error creating token:', error);
      setNotification({
        open: true,
        message: 'Error creating token: ' + (error as Error).message,
        severity: 'error',
      });
    }
  };

  const handleMintToken = async () => {
    try {
      if (!publicKey || !mint || !signTransaction) {
        throw new Error('Wallet not connected or token not created!');
      }

      const transaction = new Transaction();
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      // Create the token account if it doesn't exist
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        {
          publicKey: publicKey,
          secretKey: new Uint8Array(32)
        },
        mint,
        publicKey,
        undefined,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Create the mint instruction
      const mintInstruction = createMintToInstruction(
        mint,
        tokenAccount.address,
        publicKey,
        1000000000, // 1 token with 9 decimals
        [],
        TOKEN_PROGRAM_ID
      );

      transaction.add(mintInstruction);

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, 'confirmed');
      await updateBalance();

      setNotification({
        open: true,
        message: 'Token minted successfully!',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error minting token:', error);
      setNotification({
        open: true,
        message: 'Error minting token: ' + (error as Error).message,
        severity: 'error',
      });
    }
  };

  const handleSendToken = async () => {
    try {
      if (!publicKey || !mint || !signTransaction) {
        throw new Error('Wallet not connected or token not created!');
      }

      const transaction = new Transaction();
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      // Create accounts if they don't exist
      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        {
          publicKey: publicKey,
          secretKey: new Uint8Array(32)
        },
        mint,
        publicKey,
        undefined,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      const destinationPubKey = new PublicKey(recipientAddress);
      const destinationAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        {
          publicKey: publicKey,
          secretKey: new Uint8Array(32)
        },
        mint,
        destinationPubKey,
        undefined,
        undefined,
        undefined,
        TOKEN_PROGRAM_ID
      );

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        sourceAccount.address,
        destinationAccount.address,
        publicKey,
        parseInt(amount) * 1000000000, // Convert to token decimal amount
        [],
        TOKEN_PROGRAM_ID
      );

      transaction.add(transferInstruction);

      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature, 'confirmed');
      await updateBalance();

      setNotification({
        open: true,
        message: 'Tokens sent successfully!',
        severity: 'success',
      });

      // Clear form after successful transfer
      setRecipientAddress('');
      setAmount('');
    } catch (error) {
      console.error('Error sending token:', error);
      setNotification({
        open: true,
        message: 'Error sending token: ' + (error as Error).message,
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Card sx={{ mb: 4, p: 3, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h4" gutterBottom>
                Solana Token Manager
              </Typography>
            </Grid>
            <Grid item>
              <WalletMultiButton />
            </Grid>
          </Grid>
          
          {publicKey && (
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Wallet Address: {publicKey.toString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Balance: {balance} SOL
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {publicKey ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Create Token
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateToken}
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Create New Token
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Mint Token
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleMintToken}
                  fullWidth
                  disabled={!mint}
                  sx={{ mt: 2 }}
                >
                  Mint Token
                </Button>
                {!mint && (
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Create a token first
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Send Token
                </Typography>
                <TextField
                  label="Recipient Address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  disabled={!mint}
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  disabled={!mint}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendToken}
                  fullWidth
                  disabled={!mint || !recipientAddress || !amount}
                  sx={{ mt: 2 }}
                >
                  Send Token
                </Button>
                {!mint && (
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Create a token first
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card sx={{ mt: 4, p: 3, backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom>
              Please connect your wallet to continue
            </Typography>
          </CardContent>
        </Card>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TokenManager;
