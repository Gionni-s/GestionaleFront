'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { axiosInstance as api } from '@/services/axios/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface Recipe {
  _id: string;
  name: string;
  userId: string;
  ingridients: RecipeIngridient[];
  cookbookId: string;
  cookBook: CookBook;
  food: Ingridient;
  note?: string;
}

interface Ingridient {
  _id: string;
  name: string;
}

interface CookBook {
  _id: string;
  name: string;
}

interface RecipeIngridient {
  foodId: string;
  name: string;
  quantity: number;
  food?: { _id: string; name: string };
}

const RecipeDetail: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        const response = await api.get<Recipe>(`/recipes/${id}`);
        setRecipe(response.data);
      } catch (error) {
        console.error('Failed to fetch recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-2xl">
      <Button
        variant="outline"
        onClick={() => router.replace('/Recipe')}
        className="mb-4"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Back
      </Button>
      <Card className="w-full h-[400px] flex flex-col justify-between p-6 border rounded-lg shadow-md">
        <CardContent className="flex flex-col h-full">
          {loading ? (
            <Skeleton className="h-full w-full rounded-lg" />
          ) : recipe ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">
                {recipe.name}
              </h1>
              <p className="text-gray-500">
                Cookbook: {recipe.cookBook?.name || 'N/A'}
              </p>
              <h2 className="mt-4 text-lg font-semibold text-gray-700">
                Ingredients:
              </h2>
              <ul className="list-disc pl-5 max-h-32">
                {recipe.ingridients.map((ing, index) => (
                  <li key={index} className="text-gray-800">
                    {ing.food?.name || 'Unknown'} - {ing.quantity}
                  </li>
                ))}
              </ul>
              {recipe.note && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Notes:
                  </h3>
                  <div className="mt-4 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-lg">
                    <p className="text-gray-600 text-sm whitespace-pre-wrap ">
                      {recipe.note}
                    </p>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-center text-lg text-gray-500">
              Recipe not found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecipeDetail;
