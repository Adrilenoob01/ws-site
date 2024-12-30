import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderProject } from "@/types/supabase";
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PaymentFormProps {
  packs: OrderProject[];
  onPackSelect: (packId: string) => void;
  selectedPack: OrderProject | null;
  amount: number;
  setAmount: (amount: number) => void;
  isProcessing: boolean;
  getRemainingAmount: () => number;
  createInvestment: (details: any) => Promise<void>;
}

export const PaymentForm = ({
  packs,
  onPackSelect,
  selectedPack,
  amount,
  setAmount,
  isProcessing,
  getRemainingAmount,
  createInvestment,
}: PaymentFormProps) => {
  const isValidAmount = () => {
    if (!selectedPack) return false;
    const remainingAmount = getRemainingAmount();
    const numericAmount = Number(amount);
    return numericAmount >= selectedPack.min_amount && numericAmount <= remainingAmount;
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="pack">Pack d'investissement</Label>
        <Select onValueChange={onPackSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez un pack" />
          </SelectTrigger>
          <SelectContent>
            {packs.map((pack) => (
              <SelectItem key={pack.id} value={pack.id}>
                {pack.name} - Min: {pack.min_amount}€ ({pack.return_rate}% de rendement)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPack && (
        <>
          <div>
            <Label htmlFor="amount">Montant à investir (€)</Label>
            <Input
              id="amount"
              type="number"
              min={selectedPack.min_amount}
              max={getRemainingAmount()}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Montant minimum : {selectedPack.min_amount}€
              <br />
              Montant restant à collecter : {getRemainingAmount()}€
            </p>
          </div>

          {isValidAmount() && (
            <div className="space-y-4">
              <PayPalButtons
                disabled={isProcessing}
                style={{ layout: "vertical" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        amount: {
                          value: amount.toString(),
                          currency_code: "EUR"
                        },
                        description: `Investissement - ${selectedPack.name}`
                      }
                    ]
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    const details = await actions.order.capture();
                    await createInvestment(details);
                  }
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};