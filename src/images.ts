export enum ImageTypes {
    Project = "project",
    User = "user"
}


export function getImage(img : string | null, type : ImageTypes) : string {
    if (type == ImageTypes.Project) {
        return img ? `/uploads/project/${img}` : "/project.svg";
    } else {
        return img ? `/uploads/user/${img}` : "/avatar.svg";
    }
}