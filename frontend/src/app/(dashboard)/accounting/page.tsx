'use client';

import { useState, useEffect } from 'react';
import { accountingService } from '@/services/accounting.service';
import { Plus, Download, Upload, FileSpreadsheet, BookOpen, Calculator } from 'lucide-react';

export default function AccountingPage() {
    const [activeTab, setActiveTab] = useState('accounts');
    const [accounts, setAccounts] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Chart of Accounts
    const [showAccountForm, setShowAccountForm] = useState(false);
    const [accountForm, setAccountForm] = useState({
        accountCode: '',
        accountName: '',
        accountType: 'Asset',
        openingBalance: 0,
        gstApplicable: false,
    });

    // Ledger Reports
    const [selectedAccount, setSelectedAccount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [ledgerData, setLedgerData] = useState<any>(null);

    // Excel Import
    const [excelFile, setExcelFile] = useState<File | null>(null);

    // Bank Statement Upload
    const [selectedBankAccount, setSelectedBankAccount] = useState('');
    const [bankStatementFile, setBankStatementFile] = useState<File | null>(null);

    useEffect(() => {
        loadAccounts();
        loadBankAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            const data = await accountingService.getAccounts();
            setAccounts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    };

    const loadBankAccounts = async () => {
        try {
            const data = await accountingService.getBankAccounts();
            setBankAccounts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error loading bank accounts:', error);
        }
    };

    const handleCreateAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await accountingService.createAccount(accountForm);
            alert('Account created successfully!');
            setShowAccountForm(false);
            setAccountForm({
                accountCode: '',
                accountName: '',
                accountType: 'Asset',
                openingBalance: 0,
                gstApplicable: false,
            });
            loadAccounts();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleExcelImport = async () => {
        if (!excelFile) {
            alert('Please select an Excel file');
            return;
        }

        setLoading(true);
        try {
            const result: any = await accountingService.importJournalEntriesFromExcel(excelFile);
            alert(`Imported ${result?.imported ?? 0} of ${result?.total ?? 0} entries successfully!`);
            setExcelFile(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to import Excel file');
        } finally {
            setLoading(false);
        }
    };

    const handleBankStatementUpload = async () => {
        if (!selectedBankAccount || !bankStatementFile) {
            alert('Please select a bank account and file');
            return;
        }

        setLoading(true);
        try {
            const result: any = await accountingService.uploadBankStatement(selectedBankAccount, bankStatementFile);
            alert(`Uploaded ${result?.total ?? 0} transactions successfully!`);
            setBankStatementFile(null);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to upload bank statement');
        } finally {
            setLoading(false);
        }
    };

    const handleGetLedger = async () => {
        if (!selectedAccount || !startDate || !endDate) {
            alert('Please select account and date range');
            return;
        }

        setLoading(true);
        try {
            const data = await accountingService.getAccountLedger(selectedAccount, startDate, endDate);
            setLedgerData(data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to get ledger');
        } finally {
            setLoading(false);
        }
    };

    const handleExportLedger = async () => {
        if (!selectedAccount || !startDate || !endDate) {
            alert('Please select account and date range');
            return;
        }

        setLoading(true);
        try {
            await accountingService.exportLedgerToExcel(selectedAccount, startDate, endDate);
            alert('Ledger exported successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to export ledger');
        } finally {
            setLoading(false);
        }
    };

    const handleExportITR = async () => {
        const financialYear = prompt('Enter Financial Year (e.g., 2024-25):');
        if (!financialYear) return;

        setLoading(true);
        try {
            const data = await accountingService.exportForITR(financialYear);
            // Download as JSON
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ITR-${financialYear}.json`;
            link.click();
            alert('ITR data exported successfully!');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to export ITR data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold" style={{ color: '#7B1E12' }}>
                    Accounting & Finance
                </h1>
                <p className="text-gray-600 mt-2">
                    Complete accounting module for CA and accountants
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'accounts'
                            ? 'border-b-2 text-[#7B1E12]'
                            : 'text-gray-600'
                    }`}
                    style={activeTab === 'accounts' ? { borderColor: '#7B1E12' } : {}}
                >
                    <BookOpen className="h-4 w-4 inline mr-2" />
                    Chart of Accounts
                </button>
                <button
                    onClick={() => setActiveTab('ledger')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'ledger'
                            ? 'border-b-2 text-[#7B1E12]'
                            : 'text-gray-600'
                    }`}
                    style={activeTab === 'ledger' ? { borderColor: '#7B1E12' } : {}}
                >
                    <Calculator className="h-4 w-4 inline mr-2" />
                    Ledger Reports
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'import'
                            ? 'border-b-2 text-[#7B1E12]'
                            : 'text-gray-600'
                    }`}
                    style={activeTab === 'import' ? { borderColor: '#7B1E12' } : {}}
                >
                    <Upload className="h-4 w-4 inline mr-2" />
                    Import/Export
                </button>
                <button
                    onClick={() => setActiveTab('bank')}
                    className={`px-4 py-2 font-medium ${
                        activeTab === 'bank'
                            ? 'border-b-2 text-[#7B1E12]'
                            : 'text-gray-600'
                    }`}
                    style={activeTab === 'bank' ? { borderColor: '#7B1E12' } : {}}
                >
                    <FileSpreadsheet className="h-4 w-4 inline mr-2" />
                    Bank Reconciliation
                </button>
            </div>

            {/* Chart of Accounts Tab */}
            {activeTab === 'accounts' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Chart of Accounts</h2>
                        <button
                            onClick={() => setShowAccountForm(!showAccountForm)}
                            className="flex items-center gap-2 px-4 py-2 text-white rounded hover:opacity-90"
                            style={{ backgroundColor: '#7B1E12' }}
                        >
                            <Plus className="h-4 w-4" />
                            Add Account
                        </button>
                    </div>

                    {showAccountForm && (
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            <h3 className="text-lg font-semibold mb-4">New Account</h3>
                            <form onSubmit={handleCreateAccount} className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Account Code (e.g., 1001)"
                                    value={accountForm.accountCode}
                                    onChange={(e) => setAccountForm({ ...accountForm, accountCode: e.target.value })}
                                    className="border p-2 rounded"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Account Name"
                                    value={accountForm.accountName}
                                    onChange={(e) => setAccountForm({ ...accountForm, accountName: e.target.value })}
                                    className="border p-2 rounded"
                                    required
                                />
                                <select
                                    value={accountForm.accountType}
                                    onChange={(e) => setAccountForm({ ...accountForm, accountType: e.target.value })}
                                    className="border p-2 rounded"
                                >
                                    <option value="Asset">Asset</option>
                                    <option value="Liability">Liability</option>
                                    <option value="Equity">Equity</option>
                                    <option value="Income">Income</option>
                                    <option value="Expense">Expense</option>
                                </select>
                                <input
                                    type="number"
                                    placeholder="Opening Balance"
                                    value={accountForm.openingBalance}
                                    onChange={(e) => setAccountForm({ ...accountForm, openingBalance: parseFloat(e.target.value) })}
                                    className="border p-2 rounded"
                                    step="0.01"
                                />
                                <label className="flex items-center gap-2 col-span-2">
                                    <input
                                        type="checkbox"
                                        checked={accountForm.gstApplicable}
                                        onChange={(e) => setAccountForm({ ...accountForm, gstApplicable: e.target.checked })}
                                    />
                                    GST Applicable
                                </label>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="col-span-2 py-2 text-white rounded"
                                    style={{ backgroundColor: '#7B1E12' }}
                                >
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Code</th>
                                    <th className="px-4 py-3 text-left">Account Name</th>
                                    <th className="px-4 py-3 text-left">Type</th>
                                    <th className="px-4 py-3 text-right">Opening Balance</th>
                                    <th className="px-4 py-3 text-right">Current Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account: any) => (
                                    <tr key={account.id} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3">{account.accountCode}</td>
                                        <td className="px-4 py-3">{account.accountName}</td>
                                        <td className="px-4 py-3">{account.accountType}</td>
                                        <td className="px-4 py-3 text-right">₹{account.openingBalance?.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">₹{account.currentBalance?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ledger Reports Tab */}
            {activeTab === 'ledger' && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Ledger Reports</h2>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="grid grid-cols-4 gap-4 mb-4">
                            <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="">Select Account</option>
                                {accounts.map((acc: any) => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.accountCode} - {acc.accountName}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="border p-2 rounded"
                            />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="border p-2 rounded"
                            />
                            <button
                                onClick={handleGetLedger}
                                disabled={loading}
                                className="py-2 text-white rounded"
                                style={{ backgroundColor: '#7B1E12' }}
                            >
                                Get Ledger
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportLedger}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded"
                            >
                                <Download className="h-4 w-4" />
                                Export to Excel
                            </button>
                        </div>
                    </div>

                    {ledgerData && (
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold mb-4">
                                {ledgerData.account.accountName} Ledger
                            </h3>
                            <div className="mb-4 flex justify-between">
                                <p><strong>Opening Balance:</strong> ₹{ledgerData.openingBalance?.toLocaleString()}</p>
                                <p><strong>Closing Balance:</strong> ₹{ledgerData.closingBalance?.toLocaleString()}</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2 text-left">Entry#</th>
                                            <th className="px-4 py-2 text-left">Narration</th>
                                            <th className="px-4 py-2 text-right">Debit</th>
                                            <th className="px-4 py-2 text-right">Credit</th>
                                            <th className="px-4 py-2 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ledgerData.entries.map((entry: any, idx: number) => (
                                            <tr key={idx} className="border-t">
                                                <td className="px-4 py-2">{new Date(entry.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">{entry.entryNumber}</td>
                                                <td className="px-4 py-2">{entry.narration}</td>
                                                <td className="px-4 py-2 text-right">{entry.debit > 0 ? `₹${entry.debit.toLocaleString()}` : '-'}</td>
                                                <td className="px-4 py-2 text-right">{entry.credit > 0 ? `₹${entry.credit.toLocaleString()}` : '-'}</td>
                                                <td className="px-4 py-2 text-right">₹{entry.balance.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Import/Export Tab */}
            {activeTab === 'import' && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Import/Export</h2>
                    
                    {/* Excel Import */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h3 className="text-lg font-semibold mb-4">Import Journal Entries from Excel</h3>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                                    className="border p-2 rounded w-full"
                                />
                            </div>
                            <button
                                onClick={handleExcelImport}
                                disabled={loading || !excelFile}
                                className="px-4 py-2 text-white rounded"
                                style={{ backgroundColor: '#7B1E12' }}
                            >
                                {loading ? 'Importing...' : 'Import'}
                            </button>
                        </div>
                    </div>

                    {/* ITR Export */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Export for ITR Filing</h3>
                        <button
                            onClick={handleExportITR}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
                        >
                            <Download className="h-4 w-4" />
                            Export ITR Data (JSON)
                        </button>
                    </div>
                </div>
            )}

            {/* Bank Reconciliation Tab */}
            {activeTab === 'bank' && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Bank Statement Upload & Reconciliation</h2>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4">Upload Bank Statement</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <select
                                value={selectedBankAccount}
                                onChange={(e) => setSelectedBankAccount(e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="">Select Bank Account</option>
                                {bankAccounts.map((bank: any) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.bankName} - {bank.accountNumber}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="file"
                                accept=".xlsx,.xls,.csv,.pdf"
                                onChange={(e) => setBankStatementFile(e.target.files?.[0] || null)}
                                className="border p-2 rounded"
                            />
                        </div>
                        <button
                            onClick={handleBankStatementUpload}
                            disabled={loading || !selectedBankAccount || !bankStatementFile}
                            className="mt-4 px-4 py-2 text-white rounded"
                            style={{ backgroundColor: '#7B1E12' }}
                        >
                            {loading ? 'Uploading...' : 'Upload & Parse Statement'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
