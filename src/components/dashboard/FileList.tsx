import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiService, FileItem, FileListResponse } from '@/lib/api';
import { 
  Download, 
  Trash2, 
  Search, 
  Eye, 
  Share, 
  File, 
  Image, 
  FileText, 
  Music, 
  Video,
  Archive,
  Code,
  Clock,
  HardDrive
} from 'lucide-react';

interface FileListProps {
  refreshTrigger: number;
}

export function FileList({ refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalFiles: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4 text-green-500" />;
    if (mimeType.includes('pdf') || mimeType.startsWith('text/')) return <FileText className="w-4 h-4 text-red-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-4 h-4 text-yellow-500" />;
    if (mimeType.includes('javascript') || mimeType.includes('html') || mimeType.includes('css')) return <Code className="w-4 h-4 text-indigo-500" />;
    return <File className="w-4 h-4 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const loadFiles = async (page = 1, query = '') => {
    setIsLoading(true);
    try {
      let response: FileListResponse;
      
      if (query.trim()) {
        response = await apiService.searchFiles({
          filename: query,
          page,
          pageSize: 20,
        });
      } else {
        response = await apiService.getFiles(page, 20);
      }
      
      setFiles(response.files);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Failed to load files",
        description: "There was an error loading your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles(1, searchQuery);
  }, [refreshTrigger]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== '') {
        loadFiles(1, searchQuery);
      } else {
        loadFiles(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDelete = async (fileId: number, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) return;

    try {
      const result = await apiService.deleteFile(fileId);
      toast({
        title: "File deleted",
        description: result.physical_file_deleted 
          ? "File deleted and removed from storage"
          : "File reference deleted",
      });
      loadFiles(currentPage, searchQuery);
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMakePublic = async (fileId: number) => {
    try {
      await apiService.makeFilePublic(fileId);
      toast({
        title: "File visibility updated",
        description: "File is now public",
      });
      loadFiles(currentPage, searchQuery);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update file visibility.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (fileId: number) => {
    const url = apiService.getDownloadUrl(fileId);
    window.open(url, '_blank');
  };

  const handlePreview = (fileId: number) => {
    const url = apiService.getPreviewUrl(fileId);
    window.open(url, '_blank');
  };

  return (
    <Card className="shadow-vault border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              Your Files
            </CardTitle>
            <CardDescription>
              {pagination.totalFiles} files in your vault
            </CardDescription>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 border rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-muted rounded" />
                <div className="flex-1 space-y-1">
                  <div className="w-48 h-4 bg-muted rounded" />
                  <div className="w-32 h-3 bg-muted rounded" />
                </div>
                <div className="w-20 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <File className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No files found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  {getFileIcon(file.mime_type)}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium truncate">{file.filename}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {formatFileSize(file.size_bytes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(file.created_at)}
                      </span>
                      {file.is_public && (
                        <Badge variant="secondary" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(file.id)}
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(file.id)}
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {!file.is_public && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMakePublic(file.id)}
                      title="Make Public"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id, file.filename)}
                    title="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => loadFiles(pagination.currentPage - 1, searchQuery)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => loadFiles(pagination.currentPage + 1, searchQuery)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}