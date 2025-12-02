using System.ComponentModel.DataAnnotations;

namespace Tool_Management_System.DTOs
{
    public class PermissionResponseDto
    {
        public int PermissionId { get; set; }
        public string PermissionName { get; set; } = string.Empty;
        public string? PermissionType { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int? AppId { get; set; }
        public string? AppName { get; set; }
    }

    public class CreatePermissionDto
    {
        [Required(ErrorMessage = "İzin adı gereklidir")]
        [StringLength(100, ErrorMessage = "İzin adı en fazla 100 karakter olabilir")]
        public string PermissionName { get; set; } = string.Empty;

        [AllowedValues("Read", "Write", "Execute",
                      ErrorMessage = "Geçerli izin türleri: Read, Write, Execute")]
        public string? PermissionType { get; set; }

        [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir")]
        public string? Description { get; set; }

        public int? AppId { get; set; }
    }

    public class UpdatePermissionDto
    {
        [Required(ErrorMessage = "İzin adı gereklidir")]
        [StringLength(100, ErrorMessage = "İzin adı en fazla 100 karakter olabilir")]
        public string PermissionName { get; set; } = string.Empty;

        [AllowedValues("Read", "Write", "Execute",
                      ErrorMessage = "Geçerli izin türleri: Read, Write, Execute")]
        public string? PermissionType { get; set; }

        [StringLength(500, ErrorMessage = "Açıklama en fazla 500 karakter olabilir")]
        public string? Description { get; set; }

        public int? AppId { get; set; }
    }

    // Enum alternatifi - Veritabanındaki constraint'e uygun
    public static class PermissionTypes
    {
        public const string Read = "Read";
        public const string Write = "Write";
        public const string Execute = "Execute";

        public static readonly string[] AllTypes = { Read, Write, Execute };

        public static readonly Dictionary<string, string> TypeDescriptions = new()
        {
            { Read, "Okuma yetkisi" },
            { Write, "Yazma yetkisi" },
            { Execute, "Çalıştırma yetkisi" }
        };
    }
}
