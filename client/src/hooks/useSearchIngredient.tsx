import { useState, useEffect, useMemo } from 'react';
import { IngredientEntry } from '../api/types';

const useSearchIngredients = (
    searchTerm: string,
    ingredients: IngredientEntry[]
) => {
    const [filteredIngredients, setFilteredIngredients] = useState<IngredientEntry[]>([]);
    const [loading, setLoading] = useState(false);

    // 使用 useMemo 快取過濾結果，避免每次渲染重算
    const allIngredients = useMemo(() => {
        return ingredients.map((i: IngredientEntry) => ({
            id: i.id,
            name: i.name,
            default_unit: i.default_unit ?? ""
        }));
    }, [ingredients]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredIngredients([]);
            setLoading(false);
            return;
        }

        // 統一 debounce 200ms，移除不必要的 API 調用（假設 ingredients 已完整載入）
        // 如果需要遠端搜索，可改回 fetchAllIngredients，但需返回結果並合併
        const delayDebounce = setTimeout(() => {
            setLoading(true);
            try {
                // 純本地過濾：高效，無網絡延遲
                const filtered = allIngredients
                    .filter((i: IngredientEntry) => {
                        const query = searchTerm.toLowerCase().trim();
                        const isEnglish = /^[\x00-\x7F]*$/.test(i.name);
                        const nameLower = i.name.toLowerCase();
                        return isEnglish
                            ? nameLower.includes(query)  // 英文：小寫包含
                            : i.name.includes(searchTerm);  // 非英文：原字包含（保留原邏輯）
                    })
                    .slice(0, 10);  // 限制 10 項，避免長列表卡頓

                // 去重（case-insensitive）
                const seenNames = new Set<string>();
                const uniqueFiltered = filtered.filter(item => {
                    const lowerName = item.name.toLowerCase();
                    if (seenNames.has(lowerName)) return false;
                    seenNames.add(lowerName);
                    return true;
                });

                setFilteredIngredients(uniqueFiltered);
            } catch (err) {
                console.error('Error filtering ingredients:', err);
                setFilteredIngredients([]);
            } finally {
                setLoading(false);
            }
        }, 200);  // 統一 200ms debounce

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, allIngredients]);  // 依賴 allIngredients 快取

    return { filteredIngredients, loading };
};

export default useSearchIngredients;