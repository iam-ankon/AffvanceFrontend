import { countries as localCountries } from '@/app/data/countries';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { KeyLabTable } from '@/features/keyword-lab/components/keylab-table';
import {
  Country,
  type KeywordSuggestion,
  Location,
  type SearchParams,
  useCountrySearch,
  useKeywordSearch,
  useLocationSearch,
  useSaveKeywordCollection
} from '@/lib/hooks/use-keyword-search';
import { useCreditStore } from '@/lib/stores/credit-store';
import type { CreditBalance } from '@/types/subscription';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/api/client';
import { AlertCircle, Check, ChevronsUpDown, History, Info, SlidersHorizontal, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import SubscriptionAlert, { useSubscriptionStatus } from '@/features/subscriptions/components/subscription-alert';

interface KeywordFormProps {
  onSearchComplete: (data: KeywordSuggestion[]) => void;
  onAddKeywords?: (keywords: Array<{ id: string | null; title: string }>) => void;
}

interface FormData {
  keyword: string;
  languageCode: string;
  locationCode: number;
  limit: number;
  // includeSeedKeyword: boolean;
  // includeSerpInfo: boolean;
  minSearchVolume?: number;
  maxSearchVolume?: number;
  minCpc?: number;
  maxCpc?: number;
  minKeywordDifficulty?: number;
  maxKeywordDifficulty?: number;
  minWords?: number;
  maxWords?: number;
  competitionLevels: string[];
  excludeKeywords: string[];
  includeKeywords: string[];
  questionOnly: boolean;
}

type LocalCountry = (typeof localCountries)[number];

export function KeywordForm({ onSearchComplete, onAddKeywords }: KeywordFormProps) {
  const queryClient = useQueryClient();
  const [keywordResults, setKeywordResults] = useState<KeywordSuggestion[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [lastSearchContext, setLastSearchContext] = useState<{
    seedKeyword: string;
    locationCode: number;
    locationName: string;
    languageCode: string;
    languageName: string;
    apiCost: number;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    keyword: '',
    languageCode: 'en',
    locationCode: 0,
    limit: 5,
    // includeSeedKeyword: true,
    // includeSerpInfo: true,
    competitionLevels: [],
    excludeKeywords: [],
    includeKeywords: [],
    questionOnly: false
  });

  const [excludeInput, setExcludeInput] = useState('');
  const [includeInput, setIncludeInput] = useState('');
  const [wordRange, setWordRange] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const {
    isBlocked,
    noSubscription,
    isLoading: isLoadingCredits
  } = useSubscriptionStatus(100, 'keyword');

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const filteredCountries = useMemo(() => {
    if (!countrySearch) return localCountries;
    return localCountries.filter((country) =>
      country.name.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  const handleCountrySelect = (country: LocalCountry) => {
    const newCountry = {
      location_code: null,
      location_name: country.name,
      country_iso_code: country.iso2,
      available_languages: []
    };

    setSelectedCountry(newCountry);
    setSelectedLocation(null);
    setCountrySearch('');
    setIsCountryOpen(false);
    // Don't update location code here, it will be set when countryDetails are loaded
  };

  // Resolve backend country by ISO first (matches DB / DataForSEO); name alone can miss (e.g. naming variants).
  const countryApiSearch =
    selectedCountry?.country_iso_code?.trim() ||
    selectedCountry?.location_name?.trim() ||
    undefined;

  const {
    data: countryDetails,
    isLoading: isCountryLoading,
    isFetching: isCountryFetching,
    error: countryError
  } = useCountrySearch(countryApiSearch);

  const countryLocationCode =
    countryDetails?.[0]?.location_code ?? selectedCountry?.location_code ?? undefined;

  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    error: locationsError
  } = useLocationSearch(countryLocationCode);

  const locationSelectDisabled =
    !selectedCountry || countryLocationCode == null || isLocationsLoading;

  const locationButtonLabel = (() => {
    if (!selectedCountry) return 'Select a country first';
    if (countryLocationCode == null) {
      if (isCountryLoading || isCountryFetching) return 'Loading country...';
      if (countryError) return 'Could not load country';
      if (Array.isArray(countryDetails) && countryDetails.length === 0) return 'Country not in database';
      return 'Select a country first';
    }
    if (isLocationsLoading) return 'Loading...';
    if (selectedLocation) return selectedLocation.location_name;
    return 'Select location...';
  })();

  useEffect(() => {
    if (countryError) {
      console.error('Error fetching country details:', countryError);
      toast.error('Failed to load country details');
    }
  }, [countryError]);

  useEffect(() => {
    if (locationsError) {
      console.error('Error fetching locations:', locationsError);
      toast.error('Failed to load locations');
    }
  }, [locationsError]);

  const { mutate: searchKeywords, isPending: isSearching } = useKeywordSearch();
  const { mutate: saveKeywordCollection, isPending: isSavingCollection } =
    useSaveKeywordCollection();

  const locations = useMemo(() => {
    return locationsData?.locations ?? [];
  }, [locationsData]);

  useEffect(() => {
    if (countryDetails?.[0]) {
      const countryData = countryDetails[0];
      const countryLocationCode = countryData.location_code;

      setSelectedCountry((prev) => ({
        ...prev,
        ...countryData,
        location_code: countryLocationCode,
        location_name: prev?.location_name || countryData.location_name,
        country_iso_code: countryData.country_iso_code,
        available_languages: countryData.available_languages || []
      }));

      // Set the location code to the country's location code by default
      // It will be overridden if a specific location is selected
      if (typeof countryLocationCode === 'number') {
        updateFormData({ locationCode: countryLocationCode });
      }
      setSelectedLocation(null);
    }
  }, [countryDetails]);

  useEffect(() => {
    // Auto-select a language only when the available set changes (country switch).
    // Do NOT depend on formData.languageCode — that would re-trigger this effect
    // on every language update and risk an infinite loop.
    const languagesFromSelected = selectedCountry?.available_languages ?? [];
    const languagesFromDetails = countryDetails?.[0]?.available_languages ?? [];
    const languages = languagesFromSelected.length ? languagesFromSelected : languagesFromDetails;

    if (!languages.length) return;

    const availableCodes = languages.map((lang) => lang.language.language_code);
    if (!formData.languageCode || !availableCodes.includes(formData.languageCode)) {
      updateFormData({ languageCode: languages[0].language.language_code });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, countryDetails]);

  useEffect(() => {
    if (selectedLocation) {
      updateFormData({ locationCode: selectedLocation.location_code });
    }
  }, [selectedLocation]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.keyword.trim()) newErrors.keyword = 'Keyword is required';
    if (!formData.languageCode) newErrors.language_code = 'Language is required';
    // if (!formData.locationCode) newErrors.location_code = 'Location is required';
    if (formData.limit < 1 || formData.limit > 100) {
      newErrors.limit = 'Limit must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isLoadingCredits) {
      toast.info('Loading credit balance. Please try again in a moment.');
      return;
    }
    if (isBlocked) {
      const message = noSubscription
        ? 'You need an active subscription to search keywords. Subscribe to a plan to continue.'
        : 'You have 0 keyword credits remaining. Add credits or upgrade your plan to continue.';
      const openUpgradeModal = useCreditStore.getState().openUpgradeModal;
      openUpgradeModal(message, 'keyword');
      return;
    }
    if (!validate()) return;

    const payload: SearchParams = {
      keyword: formData.keyword,
      language_code: formData.languageCode,
      location_code: formData.locationCode,
      limit: formData.limit
      // include_seed_keyword: formData.includeSeedKeyword,
      // include_serp_info: formData.includeSerpInfo
    };

    // Add optional fields
    if (formData.minSearchVolume !== undefined) {
      payload.min_search_volume = formData.minSearchVolume;
    }
    if (formData.maxSearchVolume !== undefined) {
      payload.max_search_volume = formData.maxSearchVolume;
    }
    if (formData.minCpc !== undefined) {
      payload.min_cpc = formData.minCpc;
    }
    if (formData.maxCpc !== undefined) {
      payload.max_cpc = formData.maxCpc;
    }
    if (formData.minKeywordDifficulty !== undefined) {
      payload.min_keyword_difficulty = formData.minKeywordDifficulty;
    }
    if (formData.maxKeywordDifficulty !== undefined) {
      payload.max_keyword_difficulty = formData.maxKeywordDifficulty;
    }
    if (formData.minWords !== undefined) {
      payload.min_words = formData.minWords;
    }
    if (formData.maxWords !== undefined) {
      payload.max_words = formData.maxWords;
    }
    if (formData.competitionLevels.length > 0) {
      payload.competition_levels = formData.competitionLevels;
    }
    if (formData.excludeKeywords.length > 0) {
      payload.exclude_keywords = formData.excludeKeywords;
    }
    if (formData.includeKeywords.length > 0) {
      payload.include_keywords = formData.includeKeywords;
    }
    if (formData.questionOnly) {
      payload.question_only = true;
    }

    searchKeywords(payload, {
      onSuccess: (data) => {
        const keywordsArray = Array.isArray(data?.keywords) ? data.keywords : [];
        setKeywordResults(keywordsArray);
        setSelectedKeywords([]); // Clear selection on new search

        const langs =
          selectedCountry?.available_languages || countryDetails?.[0]?.available_languages || [];
        const languageName =
          langs.find((lang) => lang.language.language_code === formData.languageCode)?.language
            .language_name ??
          formData.languageCode ??
          'Unknown';
        const locationName =
          selectedLocation?.location_name ??
          selectedCountry?.location_name ??
          countryDetails?.[0]?.location_name ??
          'Unknown';

        setLastSearchContext({
          seedKeyword: formData.keyword,
          locationCode: formData.locationCode,
          locationName,
          languageCode: formData.languageCode,
          languageName,
          apiCost: typeof data?.apiCost === 'number' ? data.apiCost : 0
        });

        const creditsRemaining = data?.creditsRemaining;
        if (typeof creditsRemaining === 'number') {
          queryClient.setQueryData<CreditBalance | undefined>(
            ['subscription-credits'],
            (current) =>
              current
                ? {
                    ...current,
                    keyword_credits: creditsRemaining
                  }
                : current
          );
        } else {
          void queryClient.invalidateQueries({ queryKey: ['subscription-credits'] });
        }

        onSearchComplete(keywordsArray);
        toast.success(data?.raw?.message ?? 'Keyword search completed successfully');
      },
      onError: (error: Error) => {
        // Surface an upgrade CTA when the backend reports insufficient credits (HTTP 402).
        if (error instanceof ApiError && error.status === 402) {
          const openUpgradeModal = useCreditStore.getState().openUpgradeModal;
          openUpgradeModal(
            error.message ||
              'You do not have enough keyword credits for this search. Upgrade your plan to continue.',
            'keyword'
          );
          void queryClient.invalidateQueries({ queryKey: ['subscription-credits'] });
          return;
        }
        toast.error(error.message || 'Failed to search for keywords');
      }
    });
  };

  const handleAddSelectedToArticle = () => {
    if (!onAddKeywords) return;

    const keywordsToAdd = keywordResults
      .filter(kr => selectedKeywords.includes(kr.keyword))
      .map(kr => ({
        id: kr.id || null, // Backend might not return ID for new suggestions, or it might
        title: kr.keyword
      }));

    onAddKeywords(keywordsToAdd);
    toast.success(`Added ${keywordsToAdd.length} keywords to article`);
    setKeywordResults((prev) => prev.filter((kr) => !selectedKeywords.includes(kr.keyword)));
    setSelectedKeywords([]); // Clear selection after adding
  };

  const handleCompetitionToggle = (level: string) => {
    updateFormData({
      competitionLevels: formData.competitionLevels.includes(level)
        ? formData.competitionLevels.filter((l) => l !== level)
        : [...formData.competitionLevels, level]
    });
  };

  const handleAddExcludeKeyword = () => {
    if (excludeInput.trim() && !formData.excludeKeywords.includes(excludeInput.trim())) {
      updateFormData({ excludeKeywords: [...formData.excludeKeywords, excludeInput.trim()] });
      setExcludeInput('');
    }
  };

  const handleAddIncludeKeyword = () => {
    if (includeInput.trim() && !formData.includeKeywords.includes(includeInput.trim())) {
      updateFormData({ includeKeywords: [...formData.includeKeywords, includeInput.trim()] });
      setIncludeInput('');
    }
  };

  const handleWordRangeChange = (value: string) => {
    setWordRange(value);
    if (value === 'any') {
      updateFormData({ minWords: undefined, maxWords: undefined });
    } else {
      const [min, max] = value.split('-').map(Number);
      updateFormData({ minWords: min, maxWords: max });
    }
  };

  const availableLanguages =
    selectedCountry?.available_languages || countryDetails?.[0]?.available_languages || [];

  return (
    <>
      {/* My Keywords Button */}
      <div className="mb-4 flex justify-end">
        <Button variant="outline" size="sm" asChild>
          <Link href="/app/keyword-history">
            <History className="mr-2 h-4 w-4" />
            My Keywords
          </Link>
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <SubscriptionAlert threshold={100} type="keyword" />
        {/* Keyword and Limit */}
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label htmlFor="keyword" className="text-sm">
              Keyword *
            </Label>
            <Input
              id="keyword"
              placeholder="Enter a keyword"
              value={formData.keyword}
              onChange={(e) => updateFormData({ keyword: e.target.value })}
              className="h-9 bg-white"
            />
            {errors.keyword && <p className="text-destructive text-xs">{errors.keyword}</p>}
          </div>

          {/* <div className="space-y-1.5">
            <Label htmlFor="limit" className="text-sm">
              Limit *
            </Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={100}
              value={formData.limit}
              onChange={(e) => updateFormData({ limit: Number(e.target.value) })}
              className="h-9"
            />
            {errors.limit && <p className="text-destructive text-xs">{errors.limit}</p>}
          </div> */}

          <div className="w-full space-y-1.5">
            <Label htmlFor="wordRange" className="text-sm">
              Keyword Length
            </Label>
            <Select value={wordRange} onValueChange={handleWordRangeChange}>
              <SelectTrigger id="wordRange" className="h-9 w-full bg-white">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="2-3">2-3 words</SelectItem>
                <SelectItem value="4-5">4-5 words</SelectItem>
                <SelectItem value="6-7">6-7 words</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Country *</Label>
            <Popover open={isCountryOpen} onOpenChange={setIsCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="h-9 w-full justify-between"
                  disabled={isCountryLoading && !!selectedCountry}
                  type="button"
                >
                  <span className="min-w-0 flex-1 truncate text-left">
                    {selectedCountry ? selectedCountry.location_name : 'Select country...'}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search countries..."
                    value={countrySearch}
                    onValueChange={setCountrySearch}
                  />
                  <CommandEmpty>No countries found.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-y-auto">
                    {filteredCountries.map((country) => (
                      <CommandItem
                        key={country.id}
                        value={country.name}
                        onSelect={() => handleCountrySelect(country)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedCountry?.location_name === country.name
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.location_code && (
              <p className="text-destructive text-xs">{errors.location_code}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Location *</Label>
            <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="h-9 w-full justify-between"
                  disabled={locationSelectDisabled}
                  type="button"
                >
                  <span className="min-w-0 flex-1 truncate text-left">{locationButtonLabel}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search locations..." />
                  {isLocationsLoading ? (
                    <div className="flex flex-col items-center gap-1.5 py-6 text-center text-sm text-muted-foreground">
                      <span className="animate-spin text-lg">⏳</span>
                      <span>Loading locations…</span>
                      <span className="text-xs text-muted-foreground/70">
                        Fetching from DataForSEO for the first time
                      </span>
                    </div>
                  ) : locations.length === 0 ? (
                    <CommandEmpty>No locations found.</CommandEmpty>
                  ) : (() => {
                    // Group locations by type
                    const typeOrder = ['Country', 'State', 'Province', 'Region', 'City Region', 'Municipality', 'City', 'Neighborhood', 'Postal Code', 'University', 'Airport'];
                    const grouped = locations.reduce<Record<string, Location[]>>((acc, loc) => {
                      const key = loc.location_type || 'Other';
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(loc);
                      return acc;
                    }, {});
                    const sortedTypes = Object.keys(grouped).sort((a, b) => {
                      const ai = typeOrder.indexOf(a);
                      const bi = typeOrder.indexOf(b);
                      if (ai === -1 && bi === -1) return a.localeCompare(b);
                      if (ai === -1) return 1;
                      if (bi === -1) return -1;
                      return ai - bi;
                    });
                    return (
                      <div className="max-h-[260px] overflow-y-auto">
                        {sortedTypes.map((type) => (
                          <CommandGroup key={type} heading={type}>
                            {grouped[type].map((location: Location) => (
                              <CommandItem
                                key={location.location_code}
                                value={`${location.location_name} ${type}`}
                                onSelect={() => {
                                  setSelectedLocation(location);
                                  setIsLocationOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4 shrink-0',
                                    selectedLocation?.location_code === location.location_code
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                                <span className="truncate">{location.location_name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </div>
                    );
                  })()}
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="language" className="text-sm">
              Language *
            </Label>
            <Select
              defaultValue="en"
              value={formData.languageCode}
              onValueChange={(value) => updateFormData({ languageCode: value })}
              disabled={availableLanguages.length === 0}
            >
              <SelectTrigger id="language" className="h-9 w-full bg-white">
                <SelectValue
                  placeholder={
                    availableLanguages.length === 0 ? 'No languages available' : 'Select a language'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((lang) => (
                  <SelectItem key={lang.language.language_code} value={lang.language.language_code}>
                    {lang.language.language_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.language_code && (
              <p className="text-destructive text-xs">{errors.language_code}</p>
            )}
          </div>
        </div>

        {/* Keyword Filters */}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="excludeKeywords" className="text-sm">
              Exclude Keywords
            </Label>
            <div className="flex gap-2">
              <Input
                id="excludeKeywords"
                placeholder="Add keyword to exclude"
                value={excludeInput}
                onChange={(e) => setExcludeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddExcludeKeyword();
                  }
                }}
                className="h-9"
              />
              <Button type="button" onClick={handleAddExcludeKeyword} size="sm" className="h-9">
                Add
              </Button>
            </div>
            {formData.excludeKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.excludeKeywords.map((kw) => (
                  <div
                    key={kw}
                    className="bg-destructive/10 text-destructive flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() =>
                        updateFormData({
                          excludeKeywords: formData.excludeKeywords.filter((k) => k !== kw)
                        })
                      }
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="includeKeywords" className="text-sm">
              Include Keywords
            </Label>
            <div className="flex gap-2">
              <Input
                id="includeKeywords"
                placeholder="Add keyword to include"
                value={includeInput}
                onChange={(e) => setIncludeInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIncludeKeyword();
                  }
                }}
                className="h-9"
              />
              <Button type="button" onClick={handleAddIncludeKeyword} size="sm" className="h-9">
                Add
              </Button>
            </div>
            {formData.includeKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.includeKeywords.map((kw) => (
                  <div
                    key={kw}
                    className="bg-primary/10 text-primary flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() =>
                        updateFormData({
                          includeKeywords: formData.includeKeywords.filter((k) => k !== kw)
                        })
                      }
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        <Accordion type="single" collapsible className="rounded-lg border">
          <AccordionItem value="filters" className="border-0">
            <AccordionTrigger className="px-4 hover:no-underline">
              <span className="flex items-center gap-2 text-sm">
                <SlidersHorizontal className="h-4 w-4" />
                Advanced Filters
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid gap-4 pt-2 md:grid-cols-3">
                {/* Search Volume Range */}
                <div className="space-y-2">
                  <Label htmlFor="minSearchVolume" className="text-sm">Min Search Volume</Label>
                  <Input
                    id="minSearchVolume"
                    type="number"
                    min={0}
                    placeholder="e.g. 100"
                    value={formData.minSearchVolume ?? ''}
                    onChange={(e) =>
                      updateFormData({
                        minSearchVolume: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSearchVolume" className="text-sm">Max Search Volume</Label>
                  <Input
                    id="maxSearchVolume"
                    type="number"
                    min={0}
                    placeholder="e.g. 10000"
                    value={formData.maxSearchVolume ?? ''}
                    onChange={(e) =>
                      updateFormData({
                        maxSearchVolume: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="h-9"
                  />
                </div>

                {/* Results Limit */}
                <div className="space-y-2">
                  <Label htmlFor="limit" className="text-sm">Results Limit</Label>
                  <Select
                    value={formData.limit.toString()}
                    onValueChange={(value) => updateFormData({ limit: Number(value) })}
                  >
                    <SelectTrigger id="limit" className="h-9 w-full bg-white">
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* CPC Range */}
                <div className="space-y-2">
                  <Label htmlFor="minCpc" className="text-sm">Min CPC ($)</Label>
                  <Input
                    id="minCpc"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 0.50"
                    value={formData.minCpc ?? ''}
                    onChange={(e) =>
                      updateFormData({
                        minCpc: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCpc" className="text-sm">Max CPC ($)</Label>
                  <Input
                    id="maxCpc"
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 5.00"
                    value={formData.maxCpc ?? ''}
                    onChange={(e) =>
                      updateFormData({
                        maxCpc: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="h-9"
                  />
                </div>

                {/* Keyword Difficulty Range */}
                <div className="space-y-2">
                  <Label htmlFor="minKeywordDifficulty" className="text-sm">Min Difficulty (0-100)</Label>
                  <Input
                    id="minKeywordDifficulty"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 0"
                    value={formData.minKeywordDifficulty ?? ''}
                    onChange={(e) =>
                      updateFormData({
                        minKeywordDifficulty: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="h-9"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxKeywordDifficulty" className="text-sm">Max Difficulty (0-100)</Label>
                  <Input
                    id="maxKeywordDifficulty"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="e.g. 50"
                    value={formData.maxKeywordDifficulty ?? ''}
                    onChange={(e) =>
                      updateFormData({
                        maxKeywordDifficulty: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="h-9"
                  />
                </div>

                {/* Competition Levels */}
                <div className="space-y-2">
                  <Label className="text-sm">Competition Level</Label>
                  <div className="flex gap-4 pt-1">
                    {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
                      <div key={level} className="flex items-center space-x-1.5">
                        <Checkbox
                          id={`competition-${level}`}
                          checked={formData.competitionLevels.includes(level)}
                          onCheckedChange={() => handleCompetitionToggle(level)}
                        />
                        <Label htmlFor={`competition-${level}`} className="cursor-pointer text-xs font-normal">
                          {level}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Questions Only Toggle */}
                <div className="space-y-2">
                  <Label className="text-sm">Questions Only</Label>
                  <div className="flex items-center gap-2 pt-1">
                    <Switch
                      id="questionOnly"
                      checked={formData.questionOnly}
                      onCheckedChange={(checked) => updateFormData({ questionOnly: checked })}
                    />
                    <Label htmlFor="questionOnly" className="cursor-pointer text-xs font-normal text-muted-foreground">
                      Only show question keywords (how, what, why...)
                    </Label>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSearching || isBlocked || isLoadingCredits}>
            {isLoadingCredits ? 'Loading Credits...' : isSearching ? 'Searching...' : 'Search Keywords'}
          </Button>
        </div>
      </div>

      {keywordResults.length > 0 && (
        <div className="mt-4 space-y-3">
          {selectedKeywords.length === 0 && (
            <Alert variant="default">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Select keywords from the table below and click &quot;Save Collection&quot; to save them for later use.
              </AlertDescription>
            </Alert>
          )}
          {selectedKeywords.length > 0 && (
            <div className="bg-muted/50 flex items-center justify-between rounded-lg border px-3 py-1.5">
              <p className="text-sm font-medium">
                {selectedKeywords.length} keyword{selectedKeywords.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex items-center gap-2">
                <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={isSavingCollection}>
                      Save Collection
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                      <DialogTitle>Save keyword collection</DialogTitle>
                      <DialogDescription>
                        Save your selected keyword suggestions into a reusable collection.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="collectionTitle">Title *</Label>
                        <Input
                          id="collectionTitle"
                          placeholder="e.g. Book keywords (US, English)"
                          value={collectionTitle}
                          onChange={(e) => setCollectionTitle(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="collectionDescription">Description</Label>
                        <Textarea
                          id="collectionDescription"
                          placeholder="Optional notes..."
                          value={collectionDescription}
                          onChange={(e) => setCollectionDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsSaveDialogOpen(false)}
                        disabled={isSavingCollection}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        disabled={isSavingCollection}
                        onClick={() => {
                          if (!collectionTitle.trim()) {
                            toast.error('Title is required');
                            return;
                          }
                          if (!lastSearchContext) {
                            toast.error('Please search keywords first');
                            return;
                          }
                          if (selectedKeywords.length === 0) {
                            toast.error('Select at least one keyword');
                            return;
                          }

                          const selectedKeywordObjects = keywordResults.filter((k) =>
                            selectedKeywords.includes(k.keyword)
                          );

                          saveKeywordCollection(
                            {
                              title: collectionTitle.trim(),
                              description: collectionDescription.trim(),
                              seed_keyword: lastSearchContext.seedKeyword,
                              location_code: lastSearchContext.locationCode,
                              location_name: lastSearchContext.locationName,
                              language_code: lastSearchContext.languageCode,
                              language_name: lastSearchContext.languageName,
                              total_suggestions_received: keywordResults.length,
                              api_cost: lastSearchContext.apiCost,
                              keywords: selectedKeywordObjects
                            },
                            {
                              onSuccess: (res) => {
                                const collectionId = res?.data?.id;

                                toast.success(res?.message ?? 'Collection saved successfully', {
                                  description: collectionId
                                    ? 'Click to view your saved collection'
                                    : undefined,
                                  action: collectionId ? {
                                    label: 'View',
                                    onClick: () => {
                                      window.location.href = `/app/keyword-history/${collectionId}`;
                                    }
                                  } : undefined
                                });

                                void queryClient.invalidateQueries({
                                  queryKey: ['keyword-collections']
                                });
                                void queryClient.invalidateQueries({
                                  queryKey: ['subscription-credits']
                                });

                                setIsSaveDialogOpen(false);
                                setKeywordResults((prev) =>
                                  prev.filter((kr) => !selectedKeywords.includes(kr.keyword))
                                );
                                setSelectedKeywords([]);
                                setCollectionTitle('');
                                setCollectionDescription('');
                              },
                              onError: (error: Error) => {
                                // Keep dialog + form state so user can retry without losing their selection.
                                toast.error(error.message || 'Failed to save collection');
                              }
                            }
                          );
                        }}
                      >
                        {isSavingCollection ? 'Saving...' : 'Save'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {onAddKeywords && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleAddSelectedToArticle}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Add to Article
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={() => setSelectedKeywords([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
          <KeyLabTable
            data={keywordResults}
            selectedKeywords={selectedKeywords}
            onSelectionChange={setSelectedKeywords}
          />
        </div>
      )}
    </>
  );
}
