package kr.co.nomadlab.dplog.license;

public record DownloadArtifactsResponse(
        String macUrl,
        String windowsUrl,
        String minimumVersion
) {
}
