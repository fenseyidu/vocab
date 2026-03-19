import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  Edit3, 
  Trash2, 
  Save, 
  BookOpen, 
  Plus,
  ChevronLeft
} from 'lucide-react';
import { WordPair, WordList, ViewMode } from './types';
import { InputArea } from './components/InputArea';
import { PrintLayout } from './components/PrintLayout';

const App: React.FC = () => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.INPUT);
  const [inputText, setInputText] = useState<string>('');
  const [currentList, setCurrentList] = useState<WordList>({
    id: 'default',
    title: 'My Vocabulary List',
    createdAt: Date.now(),
    words: []
  });
  const [savedLists, setSavedLists] = useState<WordList[]>([]);
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [saveFilename, setSaveFilename] = useState<string>('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState<{ english: string; chinese: string }>({ english: '', chinese: '' });
  const [showSaved, setShowSaved] = useState<boolean>(false);

  // Load saved lists on mount
  useEffect(() => {
    const stored = localStorage.getItem('vocab_lists');
    if (stored) {
      setSavedLists(JSON.parse(stored));
    }
  }, []);

  // Handlers
  const handleProcessInput = () => {
    const lines = inputText.split('\n');
    const existingWords = currentList.words;

    const processedWords: WordPair[] = lines
      .filter(line => line.trim().length > 0)
      .map((line, index) => {
        const parts = line.split('#');
        const english = parts[0]?.trim() || '';
        const chinese = parts[1]?.trim() || '';
        // Try to preserve existing word ID if available
        const existingWord = existingWords[index];
        const id = existingWord && existingWord.english === english && existingWord.chinese === chinese
          ? existingWord.id
          : Math.random().toString(36).substring(7);
        return {
          id,
          english,
          chinese,
          phonetic: existingWord?.phonetic || ''
        };
      })
      .filter(w => w.english || w.chinese);

    const newList = { ...currentList, words: processedWords, createdAt: Date.now() };
    setCurrentList(newList);

    // If new list (no editingListId), show save modal first
    if (!editingListId) {
      setSaveFilename(currentList.title || 'My Vocabulary List');
      setShowSaveModal(true);
      // Don't switch to PREVIEW yet, wait for save confirmation
    } else {
      // Existing list - auto-save
      setViewMode(ViewMode.PREVIEW);
      setTimeout(() => autoSave(newList), 0);
    }
  };

  const handleConfirmSaveFromInput = () => {
    if (!saveFilename.trim()) return;
    const newList = {
      ...currentList,
      id: Math.random().toString(36).substring(7),
      title: saveFilename.trim(),
      createdAt: Date.now()
    };

    const updatedLists = [...savedLists, newList];
    setSavedLists(updatedLists);
    localStorage.setItem('vocab_lists', JSON.stringify(updatedLists));
    setEditingListId(newList.id);
    setCurrentList(newList);
    setShowSaveModal(false);
    setViewMode(ViewMode.PREVIEW);
    alert('保存成功！');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      alert('请在打印弹窗中选择「存储为PDF」或「保存到文件」选项。');
    }
    window.print();
  };

  const handleSave = () => {
    // If already editing an existing list, save directly
    if (editingListId) {
      const newList = {
        ...currentList,
        id: editingListId,
        title: currentList.title || 'Untitled List',
        createdAt: Date.now()
      };

      const updatedLists = savedLists.map(l => l.id === editingListId ? newList : l);
      setSavedLists(updatedLists);
      localStorage.setItem('vocab_lists', JSON.stringify(updatedLists));
      alert('保存成功！');
    } else {
      // New list - show modal to enter filename
      setSaveFilename(currentList.title);
      setShowSaveModal(true);
    }
  };

  const loadList = (list: WordList) => {
    setCurrentList(list);
    setInputText(list.words.map(w => `${w.english} # ${w.chinese}`).join('\n'));
    setEditingListId(list.id);
    setViewMode(ViewMode.PREVIEW);
  };

  const clearCurrent = () => {
    setCurrentList({
      id: 'new',
      title: 'New Vocabulary List',
      createdAt: Date.now(),
      words: []
    });
    setInputText('');
    setViewMode(ViewMode.INPUT);
    setEditingListId(null);
  };

  const handleDelete = (listId: string) => {
    const newSaved = savedLists.filter(l => l.id !== listId);
    setSavedLists(newSaved);
    localStorage.setItem('vocab_lists', JSON.stringify(newSaved));
    setShowDeleteConfirm(null);
  };

  const handleEdit = (list: WordList) => {
    setCurrentList(list);
    setInputText(list.words.map(w => `${w.english} # ${w.chinese}`).join('\n'));
    setEditingListId(list.id);
    setViewMode(ViewMode.PREVIEW);
  };

  // Auto-save to localStorage
  const autoSave = (listToSave?: WordList) => {
    if (!editingListId) return;
    const updatedList = listToSave || currentList;

    // Use functional update to get latest savedLists
    setSavedLists(prevLists => {
      const updatedLists = prevLists.map(l => l.id === editingListId ? updatedList : l);
      localStorage.setItem('vocab_lists', JSON.stringify(updatedLists));
      return updatedLists;
    });

    // Show saved indicator
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 1500);
  };

  const startEditWord = (word: WordPair) => {
    setEditingWordId(word.id);
    setEditingWord({ english: word.english, chinese: word.chinese });
  };

  const saveEditWord = () => {
    if (!editingWordId) return;
    const updatedList = {
      ...currentList,
      words: currentList.words.map(w =>
        w.id === editingWordId
          ? { ...w, english: editingWord.english.trim(), chinese: editingWord.chinese.trim() }
          : w
      )
    };
    setCurrentList(updatedList);
    setEditingWordId(null);
    // Auto-save if editing existing list
    if (editingListId) {
      setTimeout(() => autoSave(updatedList), 0);
    }
  };

  const cancelEditWord = () => {
    setEditingWordId(null);
  };

  const deleteWord = (wordId: string) => {
    const updatedList = {
      ...currentList,
      words: currentList.words.filter(w => w.id !== wordId)
    };
    setCurrentList(updatedList);
    // Auto-save if editing existing list
    if (editingListId) {
      setTimeout(() => autoSave(updatedList), 0);
    }
  };

  return (
    <div className="min-h-screen">
      {/* --- Screen Content (Hidden when Printing) --- */}
      <div className="no-print pb-20">
        
        {/* Navigation Bar */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-2 cursor-pointer" onClick={clearCurrent}>
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <BookOpen size={20} />
                </div>
                <span className="font-bold text-xl tracking-tight text-slate-900 hover:text-indigo-600 transition-colors">VocabSmith</span>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode(ViewMode.LISTS)}
                  className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                  <BookOpen size={16} />
                  My Lists
                </button>
                <button 
                  onClick={clearCurrent}
                  className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <Plus size={16} />
                  New List
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header Title Editor */}
          {viewMode !== ViewMode.LISTS && (
            <div className="mb-8 text-center">
              <input
                type="text"
                value={currentList.title}
                onChange={(e) => setCurrentList(prev => ({ ...prev, title: e.target.value }))}
                className="text-3xl font-bold text-center bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-indigo-500 focus:ring-0 w-full max-w-lg transition-all text-slate-900 placeholder-slate-300"
                placeholder="List Title"
              />
              <p className="text-slate-500 mt-2 text-sm flex items-center justify-center gap-2">
                {viewMode === ViewMode.INPUT
                  ? "Input your words below using # separator"
                  : `${currentList.words.length} words in this list`}
                {showSaved && (
                  <span className="text-green-600 text-xs flex items-center gap-1">
                    <Save size={12} /> 已自动保存
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Conditional Views */}
          {viewMode === ViewMode.INPUT ? (
            <InputArea
              value={inputText}
              onChange={setInputText}
              onProcess={handleProcessInput}
            />
          ) : viewMode === ViewMode.LISTS ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <button
                  onClick={() => {
                    clearCurrent();
                    setViewMode(ViewMode.INPUT);
                  }}
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition-colors mb-6"
                >
                  <ChevronLeft size={16} />
                  Back to Editor
                </button>
                <h2 className="text-2xl font-bold text-slate-900">My Lists</h2>
                <p className="text-slate-500 mt-2">{savedLists.length} saved list{savedLists.length !== 1 ? 's' : ''}</p>
              </div>

              {savedLists.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-500">No saved lists yet.</p>
                  <button
                    onClick={() => {
                      clearCurrent();
                      setViewMode(ViewMode.INPUT);
                    }}
                    className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Create your first list
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {savedLists.map((list) => (
                    <div
                      key={list.id}
                      className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all relative"
                    >
                      <h4 className="font-semibold text-slate-900 pr-20">{list.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">{list.words.length} words</p>
                      <p className="text-xs text-slate-400 mt-4">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </p>

                      <div className="absolute top-4 right-4 flex gap-1">
                        <button
                          onClick={() => handleEdit(list)}
                          className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(list.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => loadList(list)}
                        className="mt-4 w-full py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        View / Print
                      </button>

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === list.id && (
                        <div className="absolute inset-0 bg-white/95 rounded-xl flex items-center justify-center gap-2 p-4">
                          <p className="text-sm text-slate-700">Delete this list?</p>
                          <button
                            onClick={() => handleDelete(list.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="px-3 py-1 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Toolbar */}
              <div className="flex flex-wrap gap-4 justify-center sm:justify-end mb-6">
                {editingListId && (
                  <button
                    onClick={() => setViewMode(ViewMode.LISTS)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-medium text-sm"
                  >
                    <ChevronLeft size={16} />
                    Back to Lists
                  </button>
                )}
                {!editingListId && (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-medium text-sm"
                  >
                    <Save size={16} />
                    Save to My Lists
                  </button>
                )}
                <button
                  onClick={() => setViewMode(ViewMode.INPUT)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg shadow-sm hover:bg-slate-50 transition-all font-medium text-sm"
                >
                  <Edit3 size={16} />
                  Edit Words
                </button>
                <button
                  onClick={handlePrint}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-md hover:bg-slate-800 transition-all font-medium text-sm hover:scale-105 active:scale-95"
                >
                  <Printer size={16} />
                  Print
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex sm:hidden items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-md hover:bg-slate-800 transition-all font-medium text-sm"
                >
                  <Download size={16} />
                  导出PDF
                </button>
              </div>

              {/* Web Preview of the Table */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-16">#</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">English</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/6">IPA</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Chinese</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {currentList.words.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                            No words generated yet. Go back to edit.
                          </td>
                        </tr>
                      ) : (
                        currentList.words.map((word, i) => (
                          <tr key={word.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-slate-400 font-mono text-sm">{i + 1}</td>
                            <td className="px-6 py-4">
                              {editingWordId === word.id ? (
                                <input
                                  type="text"
                                  value={editingWord.english}
                                  onChange={(e) => setEditingWord(prev => ({ ...prev, english: e.target.value }))}
                                  className="w-full px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  autoFocus
                                />
                              ) : (
                                <span
                                  onClick={() => startEditWord(word)}
                                  className="text-slate-900 font-medium cursor-pointer hover:text-indigo-600"
                                >
                                  {word.english}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-sans text-sm">{word.phonetic ? `[${word.phonetic}]` : '-'}</td>
                            <td className="px-6 py-4">
                              {editingWordId === word.id ? (
                                <input
                                  type="text"
                                  value={editingWord.chinese}
                                  onChange={(e) => setEditingWord(prev => ({ ...prev, chinese: e.target.value }))}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveEditWord();
                                    if (e.key === 'Escape') cancelEditWord();
                                  }}
                                  className="w-full px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 font-serif-sc"
                                />
                              ) : (
                                <span
                                  onClick={() => startEditWord(word)}
                                  className="text-slate-600 font-serif-sc cursor-pointer hover:text-indigo-600"
                                >
                                  {word.chinese}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {editingWordId === word.id ? (
                                <div className="flex gap-1">
                                  <button
                                    onClick={saveEditWord}
                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                    title="Save"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={cancelEditWord}
                                    className="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                                    title="Cancel"
                                  >
                                    <ChevronLeft size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => startEditWord(word)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                  <button
                                    onClick={() => deleteWord(word.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Saved Lists Section */}
          {savedLists.length > 0 && viewMode === ViewMode.INPUT && (
            <div className="mt-16 pt-8 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Saved Lists</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {savedLists.map((list) => (
                  <div 
                    key={list.id}
                    onClick={() => loadList(list)}
                    className="group bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer relative"
                  >
                    <h4 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{list.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{list.words.length} words</p>
                    <p className="text-xs text-slate-400 mt-4">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newSaved = savedLists.filter(l => l.id !== list.id);
                        setSavedLists(newSaved);
                        localStorage.setItem('vocab_lists', JSON.stringify(newSaved));
                      }}
                      className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* --- Save Modal (for new list only) --- */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">保存列表</h3>
            <input
              type="text"
              value={saveFilename}
              onChange={(e) => setSaveFilename(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmSaveFromInput()}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="输入文件名"
              autoFocus
            />
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSaveFromInput}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Print Layout (Only visible when printing) --- */}
      <PrintLayout list={currentList} />
      
    </div>
  );
};

export default App;