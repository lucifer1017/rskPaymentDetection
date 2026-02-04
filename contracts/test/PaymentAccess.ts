import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("PaymentAccess", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [ownerClient, user1Client, user2Client] = await viem.getWalletClients();

  const PRICE = 100_000_000_000_000n; // 0.0001 RBTC

  async function deployPaymentAccess() {
    const paymentAccess = await viem.deployContract("PaymentAccess", [PRICE]);
    return paymentAccess;
  }

  it("deploys with correct owner, price, and initial state", async function () {
    const paymentAccess = await deployPaymentAccess();

    const owner = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "owner",
    })) as string;

    const price = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "price",
    })) as bigint;

    const paused = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "paused",
    })) as boolean;

    const ownerHasAccess = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "hasAccess",
      args: [ownerClient.account.address],
    })) as boolean;

    const totalPaidOwner = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "totalPaid",
      args: [ownerClient.account.address],
    })) as bigint;

    // Address comparison should be case-insensitive (checksum vs non-checksum).
    assert.equal(owner.toLowerCase(), ownerClient.account.address.toLowerCase());
    assert.equal(price, PRICE);
    assert.equal(paused, false);
    assert.equal(ownerHasAccess, false);
    assert.equal(totalPaidOwner, 0n);
  });

  it("grants access and records payment with exact price via payForAccess", async function () {
    const paymentAccess = await deployPaymentAccess();

    const txHash = await ownerClient.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "payForAccess",
      value: PRICE,
    });

    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const hasAccess = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "hasAccess",
      args: [ownerClient.account.address],
    })) as boolean;

    const totalPaid = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "totalPaid",
      args: [ownerClient.account.address],
    })) as bigint;

    const contractBalance = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "contractBalance",
    })) as bigint;

    assert.equal(hasAccess, true);
    assert.equal(totalPaid, PRICE);
    assert.equal(contractBalance, PRICE);
  });

  it("reverts when payment is below price for first-time payer", async function () {
    const paymentAccess = await deployPaymentAccess();

    await assert.rejects(
      ownerClient.writeContract({
        address: paymentAccess.address,
        abi: paymentAccess.abi,
        functionName: "payForAccess",
        value: PRICE - 1n,
      }),
    );

    const hasAccess = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "hasAccess",
      args: [ownerClient.account.address],
    })) as boolean;

    assert.equal(hasAccess, false);
  });

  it("allows additional payments after access is granted without reverting", async function () {
    const paymentAccess = await deployPaymentAccess();

    const txHash1 = await ownerClient.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "payForAccess",
      value: PRICE,
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash1 });

    const extra = 100n;
    const txHash2 = await ownerClient.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "payForAccess",
      value: extra,
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash2 });

    const hasAccess = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "hasAccess",
      args: [ownerClient.account.address],
    })) as boolean;

    const totalPaid = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "totalPaid",
      args: [ownerClient.account.address],
    })) as bigint;

    assert.equal(hasAccess, true);
    assert.equal(totalPaid, PRICE + extra);
  });

  it("grants access via plain transfer to receive()", async function () {
    const paymentAccess = await deployPaymentAccess();

    const txHash = await ownerClient.sendTransaction({
      to: paymentAccess.address,
      value: PRICE,
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const hasAccess = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "hasAccess",
      args: [ownerClient.account.address],
    })) as boolean;

    const totalPaid = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "totalPaid",
      args: [ownerClient.account.address],
    })) as bigint;

    assert.equal(hasAccess, true);
    assert.equal(totalPaid, PRICE);
  });

  it("emits correct PaymentReceived and AccessGranted events on first purchase", async function () {
    const paymentAccess = await deployPaymentAccess();
    const fromBlock = await publicClient.getBlockNumber();

    const txHash = await ownerClient.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "payForAccess",
      value: PRICE,
    });
    await publicClient.waitForTransactionReceipt({ hash: txHash });

    const paymentEvents = await publicClient.getContractEvents({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      eventName: "PaymentReceived",
      fromBlock,
      strict: true,
    });

    assert.equal(paymentEvents.length, 1);
    const paymentEvent = paymentEvents[0];
    assert.equal(
      (paymentEvent.args.payer as string).toLowerCase(),
      ownerClient.account.address.toLowerCase(),
    );
    assert.equal(paymentEvent.args.amount, PRICE);
    assert.equal(paymentEvent.args.newTotalPaid, PRICE);

    const accessEvents = await publicClient.getContractEvents({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      eventName: "AccessGranted",
      fromBlock,
      strict: true,
    });

    assert.equal(accessEvents.length, 1);
    const accessEvent = accessEvents[0];
    assert.equal(
      (accessEvent.args.account as string).toLowerCase(),
      ownerClient.account.address.toLowerCase(),
    );
    assert.equal(accessEvent.args.price, PRICE);
  });

  it("allows only the owner to withdraw funds", async function () {
    const paymentAccess = await deployPaymentAccess();

    const txHashPay = await user1Client.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "payForAccess",
      value: PRICE,
    });
    await publicClient.waitForTransactionReceipt({ hash: txHashPay });

    const balanceBefore = await publicClient.getBalance({
      address: paymentAccess.address,
    });
    assert.equal(balanceBefore, PRICE);

    await assert.rejects(
      user1Client.writeContract({
        address: paymentAccess.address,
        abi: paymentAccess.abi,
        functionName: "withdraw",
      }),
    );

    const txHashWithdraw = await ownerClient.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "withdraw",
    });
    await publicClient.waitForTransactionReceipt({ hash: txHashWithdraw });

    const balanceAfter = await publicClient.getBalance({
      address: paymentAccess.address,
    });
    assert.equal(balanceAfter, 0n);
  });

  it("allows owner to pause and unpause the contract", async function () {
    const paymentAccess = await deployPaymentAccess();

    let paused = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "paused",
    })) as boolean;
    assert.equal(paused, false);

    const txHashPause = await ownerClient.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "pause",
    });
    await publicClient.waitForTransactionReceipt({ hash: txHashPause });

    paused = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "paused",
    })) as boolean;
    assert.equal(paused, true);

    await assert.rejects(
      ownerClient.writeContract({
        address: paymentAccess.address,
        abi: paymentAccess.abi,
        functionName: "payForAccess",
        value: PRICE,
      }),
    );

    const txHashUnpause = await ownerClient.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "unpause",
    });
    await publicClient.waitForTransactionReceipt({ hash: txHashUnpause });

    paused = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "paused",
    })) as boolean;
    assert.equal(paused, false);

    const txHashPay = await ownerClient.writeContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "payForAccess",
      value: PRICE,
    });
    await publicClient.waitForTransactionReceipt({ hash: txHashPay });

    const hasAccess = (await publicClient.readContract({
      address: paymentAccess.address,
      abi: paymentAccess.abi,
      functionName: "hasAccess",
      args: [ownerClient.account.address],
    })) as boolean;
    assert.equal(hasAccess, true);
  });

  it("prevents non-owner from pausing the contract", async function () {
    const paymentAccess = await deployPaymentAccess();

    await assert.rejects(
      user1Client.writeContract({
        address: paymentAccess.address,
        abi: paymentAccess.abi,
        functionName: "pause",
      }),
    );

    await assert.rejects(
      user1Client.writeContract({
        address: paymentAccess.address,
        abi: paymentAccess.abi,
        functionName: "unpause",
      }),
    );
  });
});

