public sealed class MyProfileDto
{
    public Guid Id {get; set; }
    public string Username { get; init; } = default!; //null but temporary. !  garanties that will not be null
    public string  Email { get; init; } = default!;

}