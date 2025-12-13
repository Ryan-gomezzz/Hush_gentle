import { Button } from "@/components/ui/Button";
import { addToCart } from "@/app/(shop)/actions";

export function AddToCartButton({
  productId,
  quantity = 1,
  className,
}: {
  productId: string;
  quantity?: number;
  className?: string;
}) {
  return (
    <form action={addToCart} className={className}>
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value={String(quantity)} />
      <Button type="submit" className="w-full">
        Add to cart
      </Button>
    </form>
  );
}


