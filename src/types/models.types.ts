import type {
  CivitaiModelDoc,
  UserModelDoc,
} from "../../shared/types/firestore";

export interface ModelData extends UserModelDoc {
  data: CivitaiModelDoc;
}
