import {File, FileProps} from "@/type/file";
import Link from "next/link";
import Image from "next/image";

const Directory = (fileProps: FileProps) => {
    return (
        <>
            <h1>{fileProps.rootPath + fileProps.subPath}</h1>
            {fileProps.subPath !== "" && <a href="../">../</a>}
            {fileProps.files.map((_, idx) => (
                <Item key={idx} subPath={fileProps.subPath} file={_}/>
            ))}
        </>
    );
};

interface Props {
    subPath: string;
    file: File;
}

const Item = ({subPath, file}: Props) => {
    function getLink(): string {
        if (file.type === "directory") {
            return `${subPath}/${file.path}/`;
        } else {
            return `api${subPath}/${file.path}/`;
        }
    }

    return (
        <div>
            <span>
                <Image src={file.type === "directory" ? "/folder.png" : "/file.png"} alt={"back"} width={18} height={18}/>
            </span>
            <Link href={getLink()}>{file.path}</Link>
        </div>
    );
};

export default Directory;
