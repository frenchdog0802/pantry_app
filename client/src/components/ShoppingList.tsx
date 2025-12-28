import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftIcon, PlusIcon, CheckIcon, SearchIcon, TrashIcon } from 'lucide-react';
import { usePantry } from '../contexts/pantryContext';
import { IngredientEntry, PantryItem, ShoppingListItem } from '../api/types';
import useSearchIngredients from '../hooks/useSearchIngredient';
import { NumberInput } from './NumberInput';

interface ShoppingListProps {
    onBack: () => void;
}

export function ShoppingList({ onBack }: ShoppingListProps) {
    const {
        shoppingList: oriShoppingList,
        ingredients,
        // shopping list functions
        addShoppingListItem,
        updateShoppingListItem,
        removeShoppingListItem,
        fetchAllShoppingListItems
    } = usePantry();

    const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [shoppingSearchQuery, setShoppingSearchQuery] = useState('');
    const [newShoppingItem, setNewShoppingItem] = useState({
        name: '',
        quantity: 1,
        unit: '',
        checked: false
    });
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [isAddingShoppingItem, setIsAddingShoppingItem] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);  // 新增：鍵盤導航索引

    // Shopping item search dropdown（直接用 name，鉤子內 debounce）
    const { filteredIngredients: filteredShoppingIngredients, loading: shoppingLoading } = useSearchIngredients(
        newShoppingItem.name,
        ingredients
    );

    // Auto-select if exactly one match and exact name match（用 useMemo 優化，避免循環）
    const autoSelectLogic = useMemo(() => {
        if (filteredShoppingIngredients.length === 1) {
            const match = filteredShoppingIngredients[0];
            if (match.name.toLowerCase() === newShoppingItem.name.toLowerCase()) {
                setNewShoppingItem(prev => ({
                    ...prev,
                    name: match.name,
                    unit: match.default_unit || '',
                }));
                setDropdownVisible(false);
            }
        }
    }, [newShoppingItem.name, filteredShoppingIngredients]);

    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchAllShoppingListItems();
            setShoppingList(data);
        };
        fetchData();
    }, []);


    useEffect(() => {
        autoSelectLogic;
    }, [autoSelectLogic]);

    // Filter shopping list items
    const filteredShoppingItems = useMemo(() => {
        return shoppingList.filter(item => {
            const isEnglish = /^[\x00-\x7F]*$/.test(item.name);
            return isEnglish
                ? item.name.toLowerCase().includes(shoppingSearchQuery.toLowerCase())
                : item.name.includes(shoppingSearchQuery);
        });
    }, [shoppingList, shoppingSearchQuery]);

    // Sync oriShoppingList to local shoppingList
    useEffect(() => {
        setShoppingList(oriShoppingList);
    }, [oriShoppingList]);

    // 新增輔助函數：選擇成分
    const handleSelectIngredient = (ingredient: IngredientEntry) => {
        setNewShoppingItem({
            name: ingredient.name,
            unit: ingredient.default_unit || '',
            quantity: 1,
            checked: false
        });
        setDropdownVisible(false);
        setSelectedIndex(-1);
    };

    const handleAddShoppingItem = () => {
        if (!newShoppingItem.name.trim()) return;
        // Check if item already exists in shopping list
        const existingItem = shoppingList.find(item => item.name.toLowerCase() === newShoppingItem.name.toLowerCase());
        if (existingItem) {
            updateShoppingListItem({ ...existingItem, quantity: newShoppingItem.quantity });
        } else {
            // Add new item
            addShoppingListItem({ ...newShoppingItem });
        }
        // Reset form
        setNewShoppingItem({
            name: '',
            quantity: 1,
            unit: '',
            checked: false
        });
        setIsAddingShoppingItem(false);
        setDropdownVisible(false);
    };

    const handleTogglePurchased = async (id: string) => {
        const item = shoppingList.find(i => i.id === id);
        if (!item) return;
        const updatedItem = { ...item, checked: !item.checked };
        const res = await updateShoppingListItem(updatedItem);
        if (res.success && res.data) {
            setShoppingList(prevList =>
                prevList.map(listItem =>
                    listItem.id === id
                        ? { ...listItem, checked: updatedItem.checked }
                        : listItem
                )
            );

            if (shoppingSearchQuery) {
                setShoppingSearchQuery('');
            }

            const newChecked = updatedItem.checked;
            setMessage(newChecked ? 'Purchased! Added to your pantry. To Buy updated.' : 'Unmarked. To Buy restored.');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
        }
    };

    const handleRemoveShoppingItem = (id: string) => {
        if (removeShoppingListItem) {
            removeShoppingListItem(id);
        }
    };

    return (
        <div className="flex flex-col w-full min-h-screen bg-gray-50">
            <div className="flex-1 overflow-y-auto pb-20">
                {/* Header */}
                <header className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-5 shadow-md">
                    <div className="container mx-auto flex justify-between items-center">
                        <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Go back">
                            <ArrowLeftIcon size={24} />
                        </button>
                        <h1 className="text-xl font-bold">Shopping List</h1>
                        <div className="w-10"></div> {/* For layout balance */}
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 container mx-auto p-5">
                    {/* Success Message Alert */}
                    {showMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm font-medium animate-fade-in">
                            {message}
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search shopping items..."
                            value={shoppingSearchQuery}
                            onChange={e => setShoppingSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Add New Shopping Item Button */}
                    {!isAddingShoppingItem ? (
                        <button
                            onClick={() => setIsAddingShoppingItem(true)}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl mb-6 shadow-sm transition-colors"
                        >
                            <PlusIcon size={18} />
                            <span>Add New Shopping Item</span>
                        </button>
                    ) : (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                            <h3 className="font-medium text-gray-700 mb-3">Add Item to Shopping List</h3>
                            <div className="space-y-3 relative">
                                <input
                                    type="text"
                                    placeholder="Search or add item name"
                                    value={newShoppingItem.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        setNewShoppingItem({ ...newShoppingItem, name: newName });
                                        setDropdownVisible(newName.length > 0);
                                        setSelectedIndex(-1);  // 重置選擇
                                    }}
                                    onKeyDown={(e) => {
                                        if (!dropdownVisible || filteredShoppingIngredients.length === 0) return;

                                        switch (e.key) {
                                            case 'ArrowDown':
                                                e.preventDefault();
                                                setSelectedIndex(prev => (prev < filteredShoppingIngredients.length - 1 ? prev + 1 : 0));
                                                break;
                                            case 'ArrowUp':
                                                e.preventDefault();
                                                setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredShoppingIngredients.length - 1));
                                                break;
                                            case 'Enter':
                                                e.preventDefault();
                                                if (selectedIndex >= 0) {
                                                    const selected = filteredShoppingIngredients[selectedIndex];
                                                    handleSelectIngredient(selected);
                                                } else if (filteredShoppingIngredients.length === 1) {
                                                    // Fallback to auto-select
                                                    handleSelectIngredient(filteredShoppingIngredients[0]);
                                                }
                                                break;
                                            case 'Escape':
                                                setDropdownVisible(false);
                                                setSelectedIndex(-1);
                                                break;
                                        }
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setDropdownVisible(false), 200);
                                    }}
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                />

                                {dropdownVisible && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                                        {shoppingLoading ? (
                                            <li className="p-3 text-center text-gray-500 text-sm flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                                Loading...
                                            </li>
                                        ) : filteredShoppingIngredients.length > 0 ? (
                                            filteredShoppingIngredients.map((ingredient: IngredientEntry, index: number) => {
                                                const isSelected = index === selectedIndex;
                                                // 高亮匹配文字（簡單實現）
                                                const query = newShoppingItem.name.toLowerCase();
                                                const highlightedName = ingredient.name.replace(
                                                    new RegExp(`(${query})`, 'gi'),
                                                    '<mark class="bg-yellow-200">$1</mark>'
                                                );
                                                return (
                                                    <li key={ingredient.id} className={`p-3 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-100'}`}>
                                                        <button
                                                            onClick={() => handleSelectIngredient(ingredient)}
                                                            className={`w-full text-left ${isSelected ? 'font-medium' : ''}`}
                                                            dangerouslySetInnerHTML={{ __html: highlightedName + ` <span class="text-sm text-gray-400">(${ingredient.default_unit})</span>` }}
                                                        />
                                                    </li>
                                                );
                                            })
                                        ) : (
                                            <li className="p-3 text-center text-gray-500 text-sm">
                                                No matching ingredients. Try typing more letters.
                                            </li>
                                        )}
                                    </ul>
                                )}

                                <div className="flex gap-2">
                                    <NumberInput
                                        min={0.1}
                                        step={0.5}
                                        value={newShoppingItem.quantity}
                                        onChange={value =>
                                            setNewShoppingItem({
                                                ...newShoppingItem,
                                                quantity: value
                                            })
                                        }
                                        className="w-1/3 p-2 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Unit (g, ml, etc.)"
                                        value={newShoppingItem.unit}
                                        onChange={(e) => setNewShoppingItem({ ...newShoppingItem, unit: e.target.value })}
                                        className="w-2/3 p-2 border border-gray-200 rounded-lg"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setNewShoppingItem({ name: '', quantity: 1, unit: '', checked: false });
                                            setIsAddingShoppingItem(false);
                                            setDropdownVisible(false);
                                        }}
                                        className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button onClick={handleAddShoppingItem} className="w-1/2 bg-blue-600 text-white py-2 rounded-lg">
                                        Add Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-semibold text-gray-800">Items to Buy</h2>
                        </div>
                        {filteredShoppingItems.length === 0 ? (
                            <div className="p-6 text-center">
                                <p className="text-gray-500">No items in your shopping list</p>
                                {shoppingSearchQuery && <p className="text-gray-400 text-sm mt-1">Try a different search term</p>}
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {filteredShoppingItems.map(item => (
                                    <li key={item.id} className={`p-4 ${item.checked ? 'bg-gray-50' : ''}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleTogglePurchased(item.id)}
                                                    className={`w-5 h-5 mr-3 flex-shrink-0 rounded border ${item.checked ? 'bg-green-500 border-green-500 flex items-center justify-center' : 'border-gray-300'
                                                        }`}
                                                    aria-label={item.checked ? 'Mark as not purchased' : 'Mark as purchased'}
                                                >
                                                    {item.checked && <CheckIcon size={12} className="text-white" />}
                                                </button>
                                                <div className={item.checked ? 'line-through text-gray-400' : ''}>
                                                    <h3 className="font-medium text-gray-800 capitalize">{item.name}</h3>
                                                    <p className="text-gray-500 text-sm">{item.quantity} {item.unit}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleRemoveShoppingItem(item.id)}
                                                    className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
                                                    aria-label="Remove item"
                                                >
                                                    <TrashIcon size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}