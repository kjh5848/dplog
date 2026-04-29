package kr.co.nomadlab.dplog.license;

import kr.co.nomadlab.dplog.common.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/downloads")
public class DownloadController {
    private final LicenseService licenseService;

    public DownloadController(LicenseService licenseService) {
        this.licenseService = licenseService;
    }

    @GetMapping("/artifacts")
    public ApiResponse<DownloadArtifactsResponse> artifacts() {
        return ApiResponse.ok(licenseService.getDownloadArtifacts());
    }
}
