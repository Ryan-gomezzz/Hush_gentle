import { toggleWishlist } from "@/app/(shop)/actions";
import { Button } from "@/components/ui/Button";

export function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  return (
    <form action={toggleWishlist} className={className}>
      <input type="hidden" name="productId" value={productId} />
      <Button type="submit" variant="secondary" className="w-full">
        Wishlist
      </Button>
    </form>
  );
}


