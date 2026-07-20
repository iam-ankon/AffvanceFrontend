'use client';

import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetContentRequest, useRetryGeneratedContent } from '@/lib/hooks/use-content-requests';
import { getContentRequestFailureSummary } from '@/lib/utils/content-request-failure';
import {
    AlertCircle,
    CheckCircle,
    CircleDashed,
    Clock,
    Loader2,
    CalendarDays,
    BarChart,
    Settings,
    FileText,
    Globe,
    Languages,
    Target,
    FileCode,
    ExternalLink,
    Coins,
    Cpu,
    Layout,
    Info,
    Hash,
    ListChecks,
    RotateCw
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface RequestedBlogDetailsProps {
    id: string;
}

export function RequestedBlogDetails({ id }: RequestedBlogDetailsProps) {
    const { data, isLoading, error } = useGetContentRequest(id);
    const retryMutation = useRetryGeneratedContent(id);
    const [retryingId, setRetryingId] = React.useState<string | null>(null);

    const handleRetry = (generatedContentId: string) => {
        setRetryingId(generatedContentId);
        retryMutation.mutate(generatedContentId, {
            onSettled: () => setRetryingId(null)
        });
    };

    const getStatusDisplay = (status: string, display?: string) => {
        let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'outline';
        let Icon = CircleDashed;

        switch (status.toLowerCase()) {
            case 'completed':
            case 'published':
                variant = 'default';
                Icon = CheckCircle;
                break;
            case 'failed':
                variant = 'destructive';
                Icon = AlertCircle;
                break;
            case 'processing':
            case 'generating':
                variant = 'secondary';
                Icon = Clock;
                break;
            default:
                variant = 'outline';
                Icon = CircleDashed;
        }

        return (
            <Badge variant={variant} className="flex w-fit items-center gap-1.5 px-3 py-1 font-medium">
                <Icon className="w-3.5 h-3.5" />
                {display || status}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-500 opacity-80" />
                <p className="text-lg font-medium">Fetching request details...</p>
                <p className="text-sm opacity-60">This may take a few seconds</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-destructive text-center max-w-md mx-auto">
                <div className="bg-rose-50 p-4 rounded-full mb-4">
                    <AlertCircle className="h-12 w-12 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Failed to load request</h3>
                <p className="text-slate-600 mb-6">The request you are looking for may have been deleted or there was a temporary server error.</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const formData = data.form_data || {};
    const failureSummary = getContentRequestFailureSummary(data);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">

            {/* --- HEADER SECTION (Full Width) --- */}
            <div className="lg:col-span-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-2">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FileText className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
                            {data.title || 'Untitled Request'}
                        </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground ml-1">
                        <span className="flex items-center gap-1.5">
                            <Hash className="w-4 h-4" />
                            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700">{id}</code>
                        </span>
                        <Separator orientation="vertical" className="h-4 hidden sm:block" />
                        <span className="flex items-center gap-1.5">
                            <CalendarDays className="w-4 h-4" />
                            Created {new Date(data.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {getStatusDisplay(data.status, data.status_display)}
                </div>
            </div>

            {failureSummary && (
                <div className="lg:col-span-12">
                    <Alert variant="destructive" className="border-rose-200 bg-rose-50 text-rose-900">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Generation failed</AlertTitle>
                        <AlertDescription className="text-rose-800">
                            {failureSummary}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* --- LEFT COLUMN: Primary Intel (2/3) --- */}
            <div className="lg:col-span-8 space-y-6">

                {/* Progress Overview */}
                <Card className="shadow-sm border-slate-200/60 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 pb-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart className="w-4 h-4 text-indigo-500" />
                                Processing Overview
                            </CardTitle>
                            <Badge variant="outline" className="bg-white text-indigo-600 border-indigo-100 px-2.5">
                                {data.progress_percentage || 0}% Complete
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-8 border border-slate-50">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                                style={{ width: `${data.progress_percentage || 0}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Items', value: data.total_keywords || 0, color: 'text-slate-600', bg: 'bg-slate-50' },
                                { label: 'Completed', value: data.completed_keywords || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                { label: 'Failed', value: data.failed_keywords || 0, color: 'text-rose-600', bg: 'bg-rose-50' },
                                { label: 'Credits Used', value: data.generated_contents?.reduce((acc: number, item: any) => acc + (item.credits_used || 0), 0) || 0, color: 'text-amber-600', bg: 'bg-amber-50' }
                            ].map((stat, idx) => (
                                <div key={idx} className={`${stat.bg} rounded-xl p-4 border border-white/50 shadow-sm transition-transform hover:scale-[1.02]`}>
                                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">{stat.label}</p>
                                    <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Content Strategy & Technical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strategy Card */}
                    <Card className="shadow-sm border-slate-200/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="w-4 h-4 text-indigo-500" />
                                Content Strategy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                        <Languages className="w-3 h-3" /> Language
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 capitalize">{formData.language || 'English'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> Region
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 capitalize">{formData.country || formData.region || 'Worldwide'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                        <Cpu className="w-3 h-3" /> Generation Type
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700">{data.generation_type_display || data.generation_type}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Search Intent
                                    </p>
                                    <p className="text-sm font-semibold text-slate-700 capitalize">{formData.searchIntent || 'N/A'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Target Audience</p>
                                <p className="text-sm text-slate-600 leading-relaxed italic">
                                    {formData.audience || 'General readers interested in the topic.'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Structural Specs */}
                    <Card className="shadow-sm border-slate-200/60">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Layout className="w-4 h-4 text-indigo-500" />
                                Structural Specs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                <span className="text-xs font-bold text-slate-500">Word Count</span>
                                <span className="text-sm font-black text-indigo-700">
                                    {formData.wordCount?.min || 1200} - {formData.wordCount?.max || 1800}
                                </span>
                            </div>
                            <div className="space-y-3 pt-1">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <div className={`w-2 h-2 rounded-full ${formData.ftcDisclosure ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        FTC Disclosure
                                    </div>
                                    <span className="font-bold text-slate-900">{formData.ftcDisclosure ? 'Enabled' : 'Disabled'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <div className={`w-2 h-2 rounded-full ${formData.autoYoutube ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        Auto YouTube Embed
                                    </div>
                                    <span className="font-bold text-slate-900">{formData.autoYoutube ? 'Active' : 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <div className={`w-2 h-2 rounded-full ${formData.imageMode === 'auto' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        Image Generation
                                    </div>
                                    <span className="font-bold text-slate-900 capitalize">{formData.imageMode || 'Manual'}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Content Tone</p>
                                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 capitalize hover:bg-indigo-100 transition-colors">
                                    {formData.tone || 'Informative'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Generated Content Listing */}
                <div className="pt-4">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                            <ListChecks className="w-5 h-5 text-indigo-600" />
                            Generated Articles
                        </h2>
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {data.generated_contents?.length || 0} Articles
                        </span>
                    </div>

                    <div className="flex flex-col gap-4">
                        {data.generated_contents?.map((item: any) => (
                            <Card key={item.id} className="group overflow-hidden border-slate-200/60 transition-all hover:shadow-md hover:border-indigo-200">
                                <div className="flex flex-col md:flex-row h-full">
                                    {/* Article Preview Info */}
                                    <div className="flex-1 p-5">
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <h4 className="font-bold text-lg leading-snug text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                                {item.title || item.keyword || 'Untitled Article'}
                                            </h4>
                                            {getStatusDisplay(item.status, item.status_display)}
                                        </div>

                                        {item.meta_description && (
                                            <p className="text-xs text-slate-500 mb-4 line-clamp-2 italic leading-relaxed">
                                                "{item.meta_description}"
                                            </p>
                                        )}

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto">
                                            <div className="space-y-1">
                                                <p className="text-[9px] uppercase font-black text-slate-400">Word Count</p>
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                                                    <FileCode className="w-3.5 h-3.5 text-slate-400" /> {item.word_count?.toLocaleString() || 0}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] uppercase font-black text-slate-400">Credits Used</p>
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
                                                    <Coins className="w-3.5 h-3.5" /> {item.credits_used || 0}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] uppercase font-black text-slate-400">Quality Score</p>
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                                                    <BarChart className="w-3.5 h-3.5 text-slate-400" />
                                                    {item.score ? (
                                                        <span className={
                                                            item.score.overall >= 66 ? 'text-emerald-600' :
                                                            item.score.overall >= 46 ? 'text-amber-600' :
                                                            'text-rose-600'
                                                        }>
                                                            {item.score.overall}/100
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">N/A</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[9px] uppercase font-black text-slate-400">Keyword</p>
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 truncate" title={item.keyword}>
                                                    <Target className="w-3.5 h-3.5 text-slate-400 shrink-0" /> <span className="truncate">{item.keyword || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar / Sidebar */}
                                    <div className="w-full md:w-16 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 flex md:flex-col items-center justify-around md:justify-center p-2 gap-4">
                                        {item.status?.toLowerCase() === 'generating' || item.status?.toLowerCase() === 'processing' ? (
                                            <div
                                                className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed shadow-sm"
                                                title="Article is currently generating..."
                                            >
                                                <ExternalLink className="w-5 h-5 opacity-50" />
                                            </div>
                                        ) : (
                                            <Link
                                                href={`/app/blogs/${item.id}`}
                                                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm transition-all shadow-sm"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </Link>
                                        )}
                                        <div className="hidden md:block w-8 h-[1px] bg-slate-200" />
                                        <div className="flex md:flex-col gap-2">
                                            {(item.image_urls?.length > 0 || item.featured_image_url) && (
                                                <div className="w-2 h-2 rounded-full bg-indigo-400" title="Images included" />
                                            )}
                                            {item.video_urls?.length > 0 && (
                                                <div className="w-2 h-2 rounded-full bg-red-400" title="Videos included" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {item.error_message && (
                                    <div className="mx-5 mb-5 p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-700 flex gap-3 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <div className="flex-1 space-y-1">
                                            <p className="font-bold">Why this article failed</p>
                                            <p>{item.error_message}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRetry(item.id)}
                                            disabled={retryingId === item.id}
                                            className="shrink-0 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <RotateCw className={`w-3.5 h-3.5 ${retryingId === item.id ? 'animate-spin' : ''}`} />
                                            {retryingId === item.id ? 'Retrying…' : 'Try Again'}
                                        </button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN: Secondary Params (1/3) --- */}
            <div className="lg:col-span-4 space-y-6">

                {/* Keywords Summary */}
                <Card className="shadow-sm border-slate-200/60">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-500" />
                            Target Keywords
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-2">
                        {formData.keywords?.length > 0 ? (
                            <div className="space-y-2">
                                {formData.keywords.map((kw: any, idx: number) => {
                                    const keywordText = kw.title || kw;
                                    const keywordContent = data.generated_contents?.find(
                                        (content: any) => content.keyword === keywordText
                                    );
                                    return (
                                        <div key={idx} className="flex flex-col gap-1">
                                            <Badge variant="outline" className="bg-slate-50 py-1.5 px-3 border-slate-200 text-slate-700 font-medium w-fit">
                                                {keywordText}
                                            </Badge>
                                            {keywordContent && (
                                                <div className="ml-1">
                                                    {getStatusDisplay(keywordContent.status, keywordContent.status_display)}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No primary keywords defined.</p>
                        )}
                        {formData.focusKeywords && (
                            <div className="pt-4 space-y-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Focus Keywords</p>
                                <p className="text-sm text-slate-600">{formData.focusKeywords}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Proposed Outline */}
                <Card className="shadow-sm border-slate-200/60">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <ListChecks className="w-4 h-4 text-indigo-500" />
                            Content Structure
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {formData.sections?.length > 0 ? (
                                formData.sections.map((section: string, idx: number) => (
                                    <div key={idx} className="flex gap-3 items-start group">
                                        <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-400 transition-colors mt-1 tabular-nums">
                                            {(idx + 1).toString().padStart(2, '0')}
                                        </span>
                                        <p className="text-xs text-slate-600 leading-normal">{section}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">Standard structural layout applied.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Generation Info */}
                <Card className="shadow-sm border-slate-200/60">
                    <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/30">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-500" />
                            Generation Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 space-y-4">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Article Type</span>
                                <span className="text-slate-900 font-bold">{data.structure_type || 'Blog Post'}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Generation Mode</span>
                                <span className="text-slate-900 font-bold">{data.generation_type_display || data.generation_type}</span>
                            </div>
                            {formData.styleNotes && (
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-medium">Style Notes</span>
                                    <span className="text-slate-900 font-bold">Provided</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-medium">Total Credits</span>
                                <span className="text-indigo-600 font-bold">
                                    {data.generated_contents?.reduce((acc: number, item: any) => acc + (item.credits_used || 0), 0) || 0} AI credits
                                </span>
                            </div>
                        </div>
                        {data.completed_at && (
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Generation Time</p>
                                <p className="text-xs font-semibold text-slate-700">
                                    {Math.round((new Date(data.completed_at).getTime() - new Date(data.started_at || data.created_at).getTime()) / 60000)} min
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
