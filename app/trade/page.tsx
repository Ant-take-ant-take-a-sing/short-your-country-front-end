// app/derivative-swipe/page.tsx
import { Suspense } from 'react';
import { SwipeCard } from '@/components/layout/SwipeCard';
import { fetchDerivativeNews } from '@/lib/newsClient';
import { stringToBytes, toHex } from 'viem';

// wrapper async untuk fetch data
async function NewsSwipeContent() {
  const newsList = await fetchDerivativeNews();

  if (newsList.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-12 text-slate-200">
        No news available yet.
      </div>
    );
  }

  return <SwipeCard newsList={newsList} />;

  // const handleLong = async (news: any) => {
  //   try {
  //     /**
  //      * 1. country → bytes32
  //      * contoh: "United States" / "US"
  //      */
  //     const countryCode = toHex(
  //       stringToBytes((news.country ?? 'US').toUpperCase(), { size: 32 })
  //     );

  //     /**
  //      * 2. collateral
  //      * sementara hardcode (nanti bisa dari SwipeCard state)
  //      * contoh: $10 USDC (6 decimals)
  //      */
  //     const collateralAmount = BigInt(10 * 1e6);

  //     /**
  //      * 3. call smart contract
  //      */
  //     const txHash = await openLongPosition(
  //       5003, // Mantle Sepolia
  //       countryCode,
  //       collateralAmount
  //     );

  //     console.log('LONG position opened:', txHash);
  //   } catch (err) {
  //     console.error('Failed to open long position:', err);
  //   }
  // };

  // return <SwipeCard newsList={newsList} onLong={handleLong} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <>
          <div className="flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-slate-200">
            Loading news cards...
          </div>
        </>
      }
    >
      <main className=" w-full flex items-center justify-center bg-gradient-to-br ">
        <NewsSwipeContent />
        {/* <Test /> */}
      </main>
    </Suspense>
  );
}
