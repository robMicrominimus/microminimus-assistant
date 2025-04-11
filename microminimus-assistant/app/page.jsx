import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useChat } from 'ai/react';

export default function MicrominimusAssistant() {
  const [style, setStyle] = useState('');
  const [price, setPrice] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [response, setResponse] = useState('');
  const { messages, append } = useChat();

  const handleAsk = async () => {
    const res = await append({
      role: 'user',
      content: `Suggest a product with style '${style}' under $${price}. Include seasonal promo if any.`,
    });
    setResponse(res?.content || 'No response.');
  };

  const handleFavorite = () => {
    if (response && !favorites.includes(response)) {
      setFavorites([...favorites, response]);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🛍️ Microminimus Sales Assistant</h1>
      <Card className="mb-4">
        <CardContent className="space-y-4">
          <Input
            placeholder="Style (e.g. mesh, string, halter)"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
          <Input
            placeholder="Max Price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button onClick={handleAsk}>Find Product</Button>
            <Button variant="outline" onClick={handleFavorite}>Save Favorite</Button>
          </div>
          {response && <p className="mt-4 text-green-700">💬 {response}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">💖 Your Favorites</h2>
          {favorites.length ? (
            <ul className="list-disc pl-6">
              {favorites.map((fav, idx) => <li key={idx}>{fav}</li>)}
            </ul>
          ) : (
            <p>No favorites yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
