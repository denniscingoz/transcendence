using Transcendence.Domain.Posts;
namespace Transcendence.Application.Posts.Interfaces;

public interface IPostRepository
{
    Task<int> CountByUserIdAsync(Guid userId);
}