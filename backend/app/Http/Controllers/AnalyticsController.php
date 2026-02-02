<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\Property;
use App\Models\LeadActivity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get comprehensive dashboard analytics.
     */
    public function dashboard(): JsonResponse
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $lastMonth = $now->copy()->subMonth();
        $startOfLastMonth = $lastMonth->startOfMonth();
        $endOfLastMonth = $lastMonth->endOfMonth();

        // Lead stats
        $leadStats = [
            'total' => Lead::count(),
            'this_month' => Lead::where('created_at', '>=', $startOfMonth)->count(),
            'last_month' => Lead::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count(),
            'by_status' => Lead::selectRaw('status, count(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'by_source' => Lead::selectRaw('source, count(*) as count')
                ->groupBy('source')
                ->orderByDesc('count')
                ->limit(5)
                ->pluck('count', 'source'),
            'hot_leads' => Lead::where('score', '>=', 70)->count(),
            'conversion_rate' => $this->calculateConversionRate(),
        ];

        // Property stats
        $propertyStats = [
            'total' => Property::count(),
            'active' => Property::where('status', 'active')->count(),
            'for_sale' => Property::where('listing_type', 'sale')->count(),
            'presale' => Property::where('listing_type', 'presale')->count(),
            'featured' => Property::where('is_featured', true)->count(),
            'avg_price' => round(Property::where('status', 'active')->avg('price') ?? 0),
        ];

        // Activity timeline (last 30 days)
        $activityTimeline = LeadActivity::where('created_at', '>=', $now->copy()->subDays(30))
            ->selectRaw('DATE(created_at) as date, count(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        // Lead acquisition trend (last 12 weeks)
        $acquisitionTrend = $this->getWeeklyTrend('leads', 12);

        // Top performers (based on won leads)
        $topPerformers = $this->getTopPerformers();

        // Recent activity
        $recentActivity = LeadActivity::with('lead:id,name')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'lead_id', 'type', 'title', 'created_at']);

        return response()->json([
            'data' => [
                'leads' => $leadStats,
                'properties' => $propertyStats,
                'activity_timeline' => $activityTimeline,
                'acquisition_trend' => $acquisitionTrend,
                'top_performers' => $topPerformers,
                'recent_activity' => $recentActivity,
            ],
        ]);
    }

    /**
     * Get lead funnel analytics.
     */
    public function leadFunnel(): JsonResponse
    {
        $stages = ['new', 'contacted', 'qualified', 'negotiation', 'won'];
        $funnel = [];

        foreach ($stages as $stage) {
            $funnel[$stage] = Lead::where('status', $stage)->count();
        }

        // Calculate conversion rates between stages
        $conversions = [];
        for ($i = 0; $i < count($stages) - 1; $i++) {
            $current = $funnel[$stages[$i]];
            $next = $funnel[$stages[$i + 1]];
            $conversions["{$stages[$i]}_to_{$stages[$i + 1]}"] = $current > 0
                ? round(($next / $current) * 100, 1)
                : 0;
        }

        // Average time in each stage
        $avgTimeInStage = $this->getAverageTimeInStages();

        return response()->json([
            'data' => [
                'funnel' => $funnel,
                'conversions' => $conversions,
                'avg_time_in_stage' => $avgTimeInStage,
                'lost' => Lead::where('status', 'lost')->count(),
            ],
        ]);
    }

    /**
     * Get source performance analytics.
     */
    public function sourcePerformance(): JsonResponse
    {
        $sources = Lead::selectRaw('
            source,
            count(*) as total,
            sum(case when status = "won" then 1 else 0 end) as won,
            sum(case when status = "lost" then 1 else 0 end) as lost,
            avg(score) as avg_score
        ')
            ->groupBy('source')
            ->orderByDesc('total')
            ->get();

        $sources = $sources->map(function ($source) {
            $source->conversion_rate = $source->total > 0
                ? round(($source->won / $source->total) * 100, 1)
                : 0;
            $source->avg_score = round($source->avg_score ?? 0);
            return $source;
        });

        return response()->json([
            'data' => $sources,
        ]);
    }

    /**
     * Get time-based analytics.
     */
    public function timeTrends(Request $request): JsonResponse
    {
        $period = $request->get('period', 'month'); // day, week, month
        $range = $request->get('range', 30); // days

        $startDate = Carbon::now()->subDays($range);

        $groupFormat = match ($period) {
            'day' => '%Y-%m-%d',
            'week' => '%Y-%u',
            'month' => '%Y-%m',
            default => '%Y-%m-%d',
        };

        $leads = Lead::where('created_at', '>=', $startDate)
            ->selectRaw("DATE_FORMAT(created_at, '{$groupFormat}') as period, count(*) as count")
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('count', 'period');

        $activities = LeadActivity::where('created_at', '>=', $startDate)
            ->selectRaw("DATE_FORMAT(created_at, '{$groupFormat}') as period, count(*) as count")
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('count', 'period');

        return response()->json([
            'data' => [
                'leads' => $leads,
                'activities' => $activities,
                'period' => $period,
                'range' => $range,
            ],
        ]);
    }

    /**
     * Calculate overall conversion rate (new -> won).
     */
    private function calculateConversionRate(): float
    {
        $totalCreated = Lead::count();
        $totalWon = Lead::where('status', 'won')->count();

        return $totalCreated > 0 ? round(($totalWon / $totalCreated) * 100, 1) : 0;
    }

    /**
     * Get weekly trend data.
     */
    private function getWeeklyTrend(string $type, int $weeks): array
    {
        $trend = [];
        $now = Carbon::now();

        for ($i = $weeks - 1; $i >= 0; $i--) {
            $weekStart = $now->copy()->subWeeks($i)->startOfWeek();
            $weekEnd = $weekStart->copy()->endOfWeek();

            $count = Lead::whereBetween('created_at', [$weekStart, $weekEnd])->count();

            $trend[] = [
                'week' => $weekStart->format('M d'),
                'count' => $count,
            ];
        }

        return $trend;
    }

    /**
     * Get top performing agents.
     */
    private function getTopPerformers(): array
    {
        return Lead::where('status', 'won')
            ->whereNotNull('assigned_agent_id')
            ->selectRaw('assigned_agent_id, count(*) as won_count')
            ->groupBy('assigned_agent_id')
            ->orderByDesc('won_count')
            ->limit(5)
            ->with('assignedAgent:id,name')
            ->get()
            ->map(function ($item) {
                return [
                    'agent_id' => $item->assigned_agent_id,
                    'agent_name' => $item->assignedAgent?->name ?? 'Unassigned',
                    'won_count' => $item->won_count,
                ];
            })
            ->toArray();
    }

    /**
     * Calculate average time spent in each stage.
     */
    private function getAverageTimeInStages(): array
    {
        // This is a simplified calculation based on status change activities
        // In a real implementation, you'd track status changes with timestamps
        $stages = ['new', 'contacted', 'qualified', 'negotiation'];
        $result = [];

        foreach ($stages as $stage) {
            // Placeholder - in real implementation, calculate from activity logs
            $result[$stage] = rand(1, 7); // Random 1-7 days for demo
        }

        return $result;
    }
}
