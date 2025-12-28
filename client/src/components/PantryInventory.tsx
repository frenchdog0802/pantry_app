import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeftIcon, PlusIcon, MinusIcon, TrashIcon, SearchIcon, PackageIcon } from 'lucide-react';
import { usePantry } from '../contexts/pantryContext';
import { IngredientEntry, PantryItem } from '../api/types';
import useSearchIngredients from '../hooks/useSearchIngredient';
import { NumberInput } from './NumberInput';

interface PantryInventoryProps {
    onBack: () => void;
}

export function PantryInventory({ onBack }: PantryInventoryProps) {
    const {
        pantryItems: oriPantryItems,
        updatePantryItem,
        addPantryItem,
        removePantryItem,
        ingredients,
        fetchAllPantryItems,
    } = usePantry();

    const [pantryItems, setPantryItems] = useState<PantryItem[]>(oriPantryItems);
    const [searchQuery, setSearchQuery] = useState('');
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: 1,
        unit: '',
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);  // 新增：鍵盤導航索引

    // Pantry item search dropdown（直接用 name，鉤子內 debounce）
    const { filteredIngredients: filteredPantryIngredients, loading: pantryLoading } = useSearchIngredients(
        newItem.name,
        ingredients
    );

    // Auto-select if exactly one match and exact name match（用 useMemo 優化，避免循環）
    const autoSelectLogic = useMemo(() => {
        if (filteredPantryIngredients.length === 1) {
            const match = filteredPantryIngredients[0];
            if (match.name.toLowerCase() === newItem.name.toLowerCase()) {
                setNewItem(prev => ({
                    ...prev,
                    name: match.name,
                    unit: match.default_unit || '',
                }));
                setShowDropdown(false);
                setSelectedIndex(-1);
            }
        }
    }, [newItem.name, filteredPantryIngredients]);

    useEffect(() => {
        autoSelectLogic;
    }, [autoSelectLogic]);

    // Filter pantry items based on search query
    const filteredItems = useMemo(() => {
        return pantryItems.filter(item => {
            const isEnglish = /^[\x00-\x7F]*$/.test(item.name);
            const matchesSearch = isEnglish
                ? item.name.toLowerCase().includes(searchQuery.toLowerCase())
                : item.name.includes(searchQuery);
            return matchesSearch;
        });
    }, [pantryItems, searchQuery]);

    useEffect(() => {
        fetchAllPantryItems();
    }, []);

    // Sync oriPantryItems to local pantryItems
    useEffect(() => {
        setPantryItems(oriPantryItems);
    }, [oriPantryItems]);

    // 新增輔助函數：選擇成分
    const handleSelectIngredient = (ingredient: IngredientEntry) => {
        setNewItem({
            name: ingredient.name,
            quantity: 1,
            unit: ingredient.default_unit || "",
        });
        setShowDropdown(false);
        setSelectedIndex(-1);
    };

    const handleUpdateQuantity = (itemName: string, amount: number) => {
        const item = pantryItems.find(item => item.name === itemName);
        if (item) {
            const newQuantity = item.quantity + amount;
            if (newQuantity >= 0) {
                updatePantryItem({ ...item, quantity: newQuantity });
            }
        }
    };

    const handleRemoveItem = (itemName: string) => {
        const item = pantryItems.find(item => item.name === itemName);
        if (item && removePantryItem) {
            removePantryItem(item.id);
        }
    };

    const handleAddItem = () => {
        if (!newItem.name.trim()) return;
        // Check if item already exists
        const existingItem = pantryItems.find(item => item.name.toLowerCase() === newItem.name.toLowerCase());
        if (existingItem) {
            updatePantryItem({ ...existingItem, quantity: newItem.quantity });
        } else {
            // Add new item
            addPantryItem({ ...newItem });
        }
        // Reset form
        setNewItem({
            name: '',
            quantity: 1,
            unit: '',
        });
        setIsAddingItem(false);
    };

    const handleCancelAddItem = () => {
        setNewItem({
            name: '',
            quantity: 1,
            unit: '',
        });
        setShowDropdown(false);
        setSelectedIndex(-1);
        setIsAddingItem(false);
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
                        <h1 className="text-xl font-bold">Kitchen Inventory</h1>
                        <div className="w-10"></div> {/* For layout balance */}
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 container mx-auto p-5">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search ingredients..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                    </div>

                    {/* Add New Item Button */}
                    {!isAddingItem ? (
                        <button
                            onClick={() => setIsAddingItem(true)}
                            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-xl mb-6 shadow-sm transition-colors"
                        >
                            <PlusIcon size={18} />
                            <span>Add New Item</span>
                        </button>
                    ) : (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
                            <h3 className="font-medium text-gray-700 mb-3">Add New Item</h3>

                            <div className="space-y-3 relative">
                                <input
                                    type="text"
                                    placeholder="Search or add item name"
                                    value={newItem.name}
                                    onChange={(e) => {
                                        const newName = e.target.value;
                                        setNewItem({ ...newItem, name: newName });
                                        setShowDropdown(newName.length > 0);
                                        setSelectedIndex(-1);  // 重置選擇
                                    }}
                                    onKeyDown={(e) => {
                                        if (!showDropdown || filteredPantryIngredients.length === 0) return;

                                        switch (e.key) {
                                            case 'ArrowDown':
                                                e.preventDefault();
                                                setSelectedIndex(prev => (prev < filteredPantryIngredients.length - 1 ? prev + 1 : 0));
                                                break;
                                            case 'ArrowUp':
                                                e.preventDefault();
                                                setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredPantryIngredients.length - 1));
                                                break;
                                            case 'Enter':
                                                e.preventDefault();
                                                if (selectedIndex >= 0) {
                                                    const selected = filteredPantryIngredients[selectedIndex];
                                                    handleSelectIngredient(selected);
                                                } else if (filteredPantryIngredients.length === 1) {
                                                    // Fallback to auto-select
                                                    handleSelectIngredient(filteredPantryIngredients[0]);
                                                }
                                                break;
                                            case 'Escape':
                                                setShowDropdown(false);
                                                setSelectedIndex(-1);
                                                break;
                                        }
                                    }}
                                    onBlur={() => {
                                        setTimeout(() => setShowDropdown(false), 200);
                                    }}
                                    className="w-full p-2 border border-gray-200 rounded-lg"
                                />

                                {showDropdown && (
                                    <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto mt-1">
                                        {pantryLoading ? (
                                            <li className="p-3 text-center text-gray-500 text-sm flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500 mr-2"></div>
                                                Loading...
                                            </li>
                                        ) : filteredPantryIngredients.length > 0 ? (
                                            filteredPantryIngredients.map((ingredient: IngredientEntry, index: number) => {
                                                const isSelected = index === selectedIndex;
                                                // 高亮匹配文字（簡單實現）
                                                const query = newItem.name.toLowerCase();
                                                const highlightedName = ingredient.name.replace(
                                                    new RegExp(`(${query})`, 'gi'),
                                                    '<mark class="bg-yellow-200">$1</mark>'
                                                );
                                                return (
                                                    <li key={ingredient.id} className={`p-3 ${isSelected ? 'bg-red-50' : 'hover:bg-red-50'}`}>
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
                                        value={newItem.quantity}
                                        onChange={value =>
                                            setNewItem({
                                                ...newItem,
                                                quantity: value
                                            })
                                        }
                                        className="w-1/3 p-2 rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Unit (g, ml, etc.)"
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        className="w-2/3 p-2 border border-gray-200 rounded-lg"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button onClick={() => handleCancelAddItem()} className="w-1/2 bg-gray-100 text-gray-700 py-2 rounded-lg">
                                        Cancel
                                    </button>
                                    <button onClick={handleAddItem} className="w-1/2 bg-red-600 text-white py-2 rounded-lg">
                                        Add Item
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="bg-white rounded-xl p-3 mb-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-gray-600 font-medium">Planned</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                <span className="text-gray-600 font-medium">To Buy</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-gray-600 font-medium">Pantry</span>
                            </div>
                        </div>
                    </div>

                    {/* Pantry Items List */}
                    <div className="space-y-3">
                        {filteredItems.length === 0 ? (
                            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                                <PackageIcon size={32} className="mx-auto mb-2 text-gray-300" />
                                <p className="text-gray-500 text-sm">No items found</p>
                                {searchQuery && (
                                    <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
                                )}
                            </div>
                        ) : (
                            filteredItems.map(item => (
                                <div key={item.name} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    {/* Item Header */}
                                    <div className="p-4 pb-3">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-800 capitalize truncate">{item.name}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{item.unit}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(item.name)}
                                                className="p-2 rounded-lg hover:bg-red-50 active:bg-red-100 text-red-500 transition-colors -mr-2"
                                                aria-label="Remove item"
                                            >
                                                <TrashIcon size={16} />
                                            </button>
                                        </div>

                                        {/* Status Grid */}
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    <span className="text-xs font-medium text-blue-700">Planned</span>
                                                </div>
                                                <span className="text-sm font-semibold text-blue-900">{item.item_planned || 0}</span>
                                            </div>
                                            <div className="bg-amber-50 rounded-lg p-2 text-center border border-amber-100">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                    <span className="text-xs font-medium text-amber-700">To Buy</span>
                                                </div>
                                                <span className="text-sm font-semibold text-amber-900">{item.item_to_buy || 0}</span>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-2 text-center border border-green-100">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    <span className="text-xs font-medium text-green-700">Pantry</span>
                                                </div>
                                                <span className="text-sm font-semibold text-green-900">{item.quantity || 0}</span>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-center gap-3 pt-2 border-t border-gray-100">
                                            <button
                                                onClick={() => handleUpdateQuantity(item.name, -0.5)}
                                                className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <MinusIcon size={18} className="text-gray-700" />
                                            </button>
                                            <div className="text-center min-w-[60px]">
                                                <div className="text-2xl font-bold text-gray-800">{item.quantity}</div>
                                            </div>
                                            <button
                                                onClick={() => handleUpdateQuantity(item.name, 0.5)}
                                                className="p-2.5 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <PlusIcon size={18} className="text-white" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}