import { useState, useEffect } from 'react';

const useSearchIngredients = (searchTerm, pantryItems, ingredients, fetchAllIngredients) => {
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        if (searchTerm.trim() === "") {
            setFilteredIngredients([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            try {
                setLoading(true);
                await fetchAllIngredients(searchTerm);

                const combined = [
                    // if is not english dont toLowerCase, but if is english do toLowerCase
                    ...pantryItems.filter(p => {
                        const isEnglish = /^[\x00-\x7F]*$/.test(p.name);
                        return isEnglish
                            ? p.name.toLowerCase().includes(searchTerm.toLowerCase())
                            : p.name.includes(searchTerm);
                    }),
                    ...ingredients
                        .filter(i => {
                            const isEnglish = /^[\x00-\x7F]*$/.test(i.name);
                            return isEnglish
                                ? i.name.toLowerCase().includes(searchTerm.toLowerCase())
                                : i.name.includes(searchTerm);
                        })
                        .map(i => ({
                            id: i.id,
                            name: i.name,
                            quantity: i.quantity ?? 1,
                            unit: i.unit ?? ""
                        }))
                ];
                setFilteredIngredients(combined);
            } catch (err) {
                console.error('Error fetching ingredients:', err);
                setFilteredIngredients([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(delayDebounce);
            controller.abort();
        };
    }, [searchTerm]);

    return { filteredIngredients, loading };
};

export default useSearchIngredients;