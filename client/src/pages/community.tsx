import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { usePregnancy } from "@/hooks/use-pregnancy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { ArrowLeft, Plus, Users, Heart, MessageCircle, Share, Send, Clock } from "lucide-react";

export default function Community() {
  const [showNewPost, setShowNewPost] = useState(false);
  const [postData, setPostData] = useState({
    title: "",
    content: "",
  });
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [commentText, setCommentText] = useState("");

  const { user } = useAuth();
  const { pregnancy, weekInfo } = usePregnancy();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["/api/community/posts"],
    enabled: !!user,
  });

  const { data: commentsData } = useQuery({
    queryKey: ["/api/community/posts", selectedPost?.id, "comments"],
    enabled: !!selectedPost,
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: any) => {
      const response = await apiRequest("POST", "/api/community/posts", post);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setShowNewPost(false);
      setPostData({ title: "", content: "" });
      toast({
        title: "Post publicado!",
        description: "Sua mensagem foi compartilhada com a comunidade.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao publicar post. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const response = await apiRequest("POST", `/api/community/posts/${postId}/like`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await apiRequest("POST", "/api/community/comments", {
        postId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts", selectedPost?.id, "comments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setCommentText("");
      toast({
        title: "Comentário adicionado!",
        description: "Seu comentário foi publicado.",
      });
    },
  });

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postData.content.trim()) {
      toast({
        title: "Erro",
        description: "O conteúdo do post é obrigatório",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({
      title: postData.title.trim() || null,
      content: postData.content.trim(),
      week: weekInfo?.week || null,
    });
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim()) return;
    
    createCommentMutation.mutate({
      postId: selectedPost.id,
      content: commentText.trim(),
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const posts = postsData?.posts || [];
  const comments = commentsData?.comments || [];

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-cream pb-20">
        <div className="p-4 pt-12">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              className="rounded-full bg-white shadow-lg"
              onClick={() => setSelectedPost(null)}
              data-testid="button-back-to-posts"
            >
              <ArrowLeft className="h-5 w-5 text-charcoal" />
            </Button>
            <h2 className="text-xl font-bold text-charcoal">Comentários</h2>
            <div className="w-10" />
          </div>

          {/* Original Post */}
          <Card className="shadow-lg mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-baby-pink text-baby-pink-dark">
                    {getInitials(selectedPost.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-semibold text-charcoal">{selectedPost.user.name}</span>
                    {selectedPost.week && (
                      <span className="text-xs text-baby-pink-dark bg-baby-pink px-2 py-1 rounded-full">
                        {selectedPost.week} semanas
                      </span>
                    )}
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(selectedPost.createdAt)}
                    </span>
                  </div>
                  {selectedPost.title && (
                    <h3 className="font-semibold text-charcoal mb-2">{selectedPost.title}</h3>
                  )}
                  <p className="text-gray-700 mb-3">{selectedPost.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {selectedPost.likes}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      {selectedPost.commentsCount}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <div className="space-y-4 mb-6">
            {comments.map((comment: any) => (
              <Card key={comment.id} className="shadow-sm" data-testid={`comment-${comment.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-baby-blue text-baby-blue-dark text-xs">
                        {getInitials(comment.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-charcoal text-sm">{comment.user.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Comment */}
          <Card className="shadow-lg sticky bottom-20">
            <CardContent className="p-4">
              <form onSubmit={handleSubmitComment} className="flex space-x-3" data-testid="form-add-comment">
                <Input
                  placeholder="Escreva um comentário..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                  data-testid="input-comment"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-baby-pink-dark hover:bg-baby-pink-dark/90"
                  disabled={createCommentMutation.isPending || !commentText.trim()}
                  data-testid="button-send-comment"
                >
                  {createCommentMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      <div className="p-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-charcoal" data-testid="text-page-title">Comunidade</h2>
          <Button 
            variant="ghost" 
            size="icon"
            className="rounded-full bg-baby-pink-dark shadow-lg"
            onClick={() => setShowNewPost(true)}
            data-testid="button-new-post"
          >
            <Plus className="h-5 w-5 text-white" />
          </Button>
        </div>

        {/* Community Stats */}
        <Card className="glass-effect shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-6">
              <div className="text-center">
                <Users className="h-8 w-8 text-baby-pink-dark mx-auto mb-1" />
                <div className="text-lg font-bold text-charcoal" data-testid="text-community-members">1.2k+</div>
                <div className="text-xs text-gray-600">Mamães</div>
              </div>
              <div className="text-center">
                <MessageCircle className="h-8 w-8 text-baby-blue-dark mx-auto mb-1" />
                <div className="text-lg font-bold text-charcoal" data-testid="text-total-posts">{posts.length}</div>
                <div className="text-xs text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <Heart className="h-8 w-8 text-coral mx-auto mb-1" />
                <div className="text-lg font-bold text-charcoal" data-testid="text-total-likes">
                  {posts.reduce((sum: number, post: any) => sum + post.likes, 0)}
                </div>
                <div className="text-xs text-gray-600">Curtidas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-charcoal mb-2">Seja a primeira!</h3>
                <p className="text-gray-600 mb-4">Compartilhe sua experiência com outras mamães</p>
                <Button
                  onClick={() => setShowNewPost(true)}
                  className="bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                  data-testid="button-first-post"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Primeiro post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post: any) => (
              <Card key={post.id} className="shadow-lg" data-testid={`post-${post.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-baby-pink text-baby-pink-dark">
                        {getInitials(post.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-charcoal">{post.user.name}</span>
                        {post.week && (
                          <span className="text-xs text-baby-pink-dark bg-baby-pink px-2 py-1 rounded-full">
                            {post.week} semanas
                          </span>
                        )}
                        <span className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(post.createdAt)}
                        </span>
                      </div>
                      {post.title && (
                        <h3 className="font-semibold text-charcoal mb-2">{post.title}</h3>
                      )}
                      <p className="text-gray-700 mb-3">{post.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 hover:text-baby-pink-dark p-0 h-auto"
                          onClick={() => likePostMutation.mutate(post.id)}
                          data-testid={`button-like-${post.id}`}
                        >
                          <Heart className="h-3 w-3" />
                          <span>{post.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 hover:text-baby-blue-dark p-0 h-auto"
                          onClick={() => setSelectedPost(post)}
                          data-testid={`button-comments-${post.id}`}
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>{post.commentsCount}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 hover:text-coral p-0 h-auto"
                          data-testid={`button-share-${post.id}`}
                        >
                          <Share className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-charcoal">Novo Post</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitPost} className="space-y-4" data-testid="form-new-post">
                <div>
                  <Label htmlFor="title" className="text-charcoal font-medium">
                    Título (opcional)
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ex: Dúvida sobre sintomas"
                    value={postData.title}
                    onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                    className="focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="input-post-title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="content" className="text-charcoal font-medium">
                    Conteúdo *
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Compartilhe sua experiência, dúvida ou dica..."
                    value={postData.content}
                    onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                    className="h-32 resize-none focus:ring-2 focus:ring-baby-pink focus:border-baby-pink-dark"
                    data-testid="textarea-post-content"
                    required
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowNewPost(false)}
                    className="flex-1"
                    data-testid="button-cancel-post"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-baby-pink-dark to-baby-blue-dark hover:opacity-90"
                    disabled={createPostMutation.isPending}
                    data-testid="button-publish-post"
                  >
                    {createPostMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Publicar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
}
