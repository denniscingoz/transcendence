**base API response**
```cs
public class ApiResponse<T>
{
    public T Data { get; set; }
    public bool IsSuccess { get; set; }
    public string Message { get; set; }
    public List<string> Errors { get; set; } = new();
    public ApiMetadata Metadata { get; set; }
}
```
**Metadata**
```cs
public class ApiMetadata
{
    public int TotalCount { get; set; }
    public int PageSize { get; set; }
    public int CurrentPage { get; set; }
}
```
**use**
```cs 
return Ok(new ApiResponse<AuthResponseDto> 
{
    Data = authResult,
    IsSuccess = true
});

or

return Unauthorized(new ApiResponse<object>
{
    IsSuccess = false,
    Errors = new() { "Invalid credentials" }
});
```

**errors**
```cs
{
  "isSuccess": false,
  "errors": [
    "Email already exists",
    "Password is too weak"
  ]
}
```
