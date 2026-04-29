package kr.co.nomadlab.dplog.license;

public record AdminDashboardSummary(
        long activeLicenses,
        long pendingDeleteKeys,
        long totalActivations
) {
}
