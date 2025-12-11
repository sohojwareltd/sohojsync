import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow" style={{borderColor: '#e5e7eb', borderTopColor: 'rgb(139, 92, 246)', borderTopWidth: '3px'}}>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgb(139, 92, 246)'}}>
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700">Total Projects</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">24</p>
                            <p className="text-xs text-gray-500">+3 this month</p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow" style={{borderColor: '#e5e7eb', borderTopColor: 'rgb(139, 92, 246)', borderTopWidth: '3px'}}>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgb(139, 92, 246)'}}>
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700">Completed</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">18</p>
                            <p className="text-xs text-gray-500">75% completion rate</p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow" style={{borderColor: '#e5e7eb', borderTopColor: 'rgb(139, 92, 246)', borderTopWidth: '3px'}}>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgb(139, 92, 246)'}}>
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700">Pending Tasks</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">47</p>
                            <p className="text-xs text-gray-500">12 due this week</p>
                        </div>
                    </div>
                    <div className="relative overflow-hidden rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow" style={{borderColor: '#e5e7eb', borderTopColor: 'rgb(139, 92, 246)', borderTopWidth: '3px'}}>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'rgb(139, 92, 246)'}}>
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                                    </svg>
                                </div>
                                <h3 className="text-xs font-semibold text-gray-700">Team Members</h3>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">32</p>
                            <p className="text-xs text-gray-500">8 active now</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 rounded-lg border bg-white shadow-sm" style={{borderColor: '#e5e7eb'}}>
                        <div className="border-b p-4" style={{borderColor: '#e5e7eb'}}>
                            <h3 className="text-sm font-semibold text-gray-800">Recent Activity</h3>
                        </div>
                        <div className="p-4 min-h-[400px] relative">
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-gray-200" />
                        </div>
                    </div>
                    
                    <div className="rounded-lg border bg-white shadow-sm" style={{borderColor: '#e5e7eb'}}>
                        <div className="border-b p-4" style={{borderColor: '#e5e7eb'}}>
                            <h3 className="text-sm font-semibold text-gray-800">Quick Stats</h3>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div>
                                    <p className="text-xs text-gray-600">In Progress</p>
                                    <p className="text-lg font-bold text-gray-900">6</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgb(139, 92, 246)'}}>
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div>
                                    <p className="text-xs text-gray-600">On Track</p>
                                    <p className="text-lg font-bold text-gray-900">15</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgb(139, 92, 246)'}}>
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div>
                                    <p className="text-xs text-gray-600">Overdue</p>
                                    <p className="text-lg font-bold text-gray-900">3</p>
                                </div>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{background: 'rgb(139, 92, 246)'}}>
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
