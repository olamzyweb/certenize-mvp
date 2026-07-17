<?php

namespace App\Http\Controllers;

use App\Models\Credential;
use App\Models\QuizSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use kornrunner\Keccak;
use Web3\Providers\HttpProvider;
use Web3\RequestManagers\HttpRequestManager;
use Web3\Web3;
use Web3p\EthereumTx\Transaction;

class CredentialController extends Controller
{
    public function mint(Request $req)
    {
        $req->validate([
            'mint_token' => 'required|string',
            'recipient_name' => 'nullable|string',
            'reciepient_name' => 'nullable|string',
        ]);

        try {
            $session = QuizSession::where('mint_token', $req->mint_token)
                ->where('status', 'passed')
                ->firstOrFail();

            $rpcUrl = env('RPC_URL');
            $privateKey = env('PRIVATE_KEY');
            $contractAddress = env('CONTRACT_ADDRESS', '0xe6b3794191523de54a03a685fdd786b313b1788c');
            $fromAddress = env('FROM_ADDRESS');

            if (!$rpcUrl || !$privateKey) {
                return response()->json(['success' => false, 'error' => 'RPC_URL or PRIVATE_KEY not set'], 500);
            }

            $privateKey = ltrim($privateKey, '0x');

            if (!preg_match('/^0x[a-fA-F0-9]{40}$/', $session->wallet_address)) {
                return response()->json(['success' => false, 'error' => 'Invalid wallet address'], 400);
            }

            $requestManager = new HttpRequestManager($rpcUrl, (int) env('RPC_TIMEOUT', 30));
            $provider = new HttpProvider($requestManager);
            $web3 = new Web3($provider);

            $metadata = [
                'name' => $session->topic,
                'description' => 'Certenize verified skill',
                'attributes' => [
                    ['trait_type' => 'Score', 'value' => (string) $session->score],
                ],
            ];
            $metadataJson = json_encode($metadata, JSON_UNESCAPED_SLASHES);
            $metadataHex = bin2hex($metadataJson);

            $selector = substr(Keccak::hash('mintTo(address,string)', 256), 0, 8);
            $addressPadded = str_pad(ltrim($session->wallet_address, '0x'), 64, '0', STR_PAD_LEFT);
            $offset = str_pad(dechex(0x40), 64, '0', STR_PAD_LEFT);
            $metadataByteLength = strlen(hex2bin($metadataHex));
            $metadataLenHex = str_pad(dechex($metadataByteLength), 64, '0', STR_PAD_LEFT);

            $mod = strlen($metadataHex) % 64;
            if ($mod !== 0) {
                $metadataHex .= str_repeat('0', 64 - $mod);
            }

            $data = '0x' . $selector . $addressPadded . $offset . $metadataLenHex . $metadataHex;

            $nonce = null;
            $web3->eth->getTransactionCount($fromAddress, 'pending', function ($err, $count) use (&$nonce) {
                if ($err !== null) {
                    throw new \Exception('getTransactionCount error: ' . $err->getMessage());
                }
                $nonce = $count;
            });

            $waitTime = 0;
            while ($nonce === null && $waitTime < 10) {
                usleep(100_000);
                $waitTime++;
            }

            if ($nonce === null) {
                return response()->json(['success' => false, 'error' => 'Failed to fetch nonce.'], 500);
            }

            if ($nonce instanceof \phpseclib\Math\BigInteger) {
                $nonceInt = (int) $nonce->toString();
            } elseif (is_string($nonce)) {
                $nonceInt = hexdec(ltrim($nonce, '0x'));
            } else {
                $nonceInt = (int) $nonce;
            }

            $gasPrice = 50 * 1_000_000_000;
            $gasLimit = 400000;

            $txArray = [
                'nonce' => '0x' . dechex($nonceInt),
                'to' => $contractAddress,
                'value' => '0x0',
                'data' => $data,
                'gas' => '0x' . dechex($gasLimit),
                'gasPrice' => '0x' . dechex($gasPrice),
                'chainId' => $this->getChainId($rpcUrl),
            ];

            $tx = new Transaction($txArray);
            $signed = $tx->sign($privateKey);
            $signedHex = (strpos($signed, '0x') === 0) ? $signed : '0x' . $signed;

            $txHash = null;
            $error = null;

            $web3->eth->sendRawTransaction($signedHex, function ($err, $tx) use (&$txHash, &$error) {
                if ($err) {
                    $error = $err->getMessage();
                } else {
                    $txHash = $tx;
                }
            });

            if ($error) {
                return response()->json(['success' => false, 'error' => $error], 500);
            }

            $recipientName = $req->input('recipient_name', $req->input('reciepient_name'));

            $cred = Credential::create([
                'wallet_address' => $session->wallet_address,
                'quiz_session_id' => $session->id,
                'token_id' => null,
                'transaction_hash' => $txHash,
                'skill' => $session->topic,
                'score' => $session->score,
                'minted_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => (string) $cred->id,
                    'tokenId' => $cred->token_id,
                    'title' => $session->topic . ' Certificate',
                    'description' => 'Certenize verified skill: ' . $session->topic,
                    'recipientAddress' => $cred->wallet_address,
                    'recipientName' => $recipientName,
                    'issueDate' => now()->toIso8601String(),
                    'topic' => $cred->skill,
                    'score' => $cred->score,
                    'imageUrl' => env('CERT_IMAGE_BASE', url('/placeholder.svg')),
                    'metadataUri' => null,
                    'transactionHash' => $txHash,
                    'minted' => true,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('SBT Minting Exception', ['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Very small helper: decide chainId by RPC URL (override by CHAIN_ID env if set)
     */
    private function getChainId($rpcUrl)
    {
        $chainId = env('CHAIN_ID');
        if (!empty($chainId)) {
            return (int) $chainId;
        }

        if (strpos($rpcUrl, 'sepolia') !== false) {
            return 11155111;
        }
        if (strpos($rpcUrl, 'goerli') !== false) {
            return 5;
        }
        if (strpos($rpcUrl, 'mainnet') !== false) {
            return 1;
        }

        return 11155111;
    }

    public function walletCredentials($wallet)
    {
        $creds = Credential::where('wallet_address', $wallet)->get();

        $data = $creds->map(function ($c) {
            return [
                'id' => (string) $c->id,
                'tokenId' => $c->token_id,
                'title' => $c->skill . ' Certificate',
                'description' => 'Certenize verified skill: ' . $c->skill,
                'recipientAddress' => $c->wallet_address,
                'recipientName' => null,
                'issueDate' => optional($c->minted_at)->toIso8601String(),
                'topic' => $c->skill,
                'score' => $c->score,
                'imageUrl' => env('CERT_IMAGE_BASE', url('/placeholder.svg')),
                'metadataUri' => null,
                'transactionHash' => $c->transaction_hash,
                'minted' => (bool) $c->minted_at,
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }
}
