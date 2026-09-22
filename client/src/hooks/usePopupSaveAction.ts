import { useEffect, useRef } from "react";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils.js";
import type ActionButton from "@arcgis/core/support/actions/ActionButton.js";
import type MapView from "@arcgis/core/views/MapView.js";
import { useCollegesUniversities } from "../useContext/collegesUniversitiesContext";
import { useSavedUniversities } from "../useContext/savedUniversitiesContext";
import { SAVE_ACTION_ID } from "../config/mapConfig";
import { toAreaInstitution } from "../utils/institutionUtils";

function updateSaveButton(
  action: ActionButton | null,
  view: MapView,
  isSaved: (uniId: number) => boolean,
) {
  if (!action) return;

  const institution = toAreaInstitution(
    view.popup?.selectedFeature?.attributes,
  );
  const alreadySaved = institution !== null && isSaved(institution.uniId);

  action.icon = alreadySaved ? "heart-f" : "heart";
  action.title = alreadySaved ? "Remove from saved" : "Save university";
}

export default function usePopupSaveAction(view: MapView | null) {
  const { collegesLayerRef } = useCollegesUniversities();
  const { isSaved, toggleSave } = useSavedUniversities();

  const savedRef = useRef({ isSaved, toggleSave });
  const saveActionRef = useRef<ActionButton | null>(null);

  useEffect(() => {
    savedRef.current = { isSaved, toggleSave };
  }, [isSaved, toggleSave]);

  useEffect(() => {
    if (!view) return;

    saveActionRef.current =
      (collegesLayerRef.current?.popupTemplate?.actions?.find(
        (action) => action.id === SAVE_ACTION_ID,
      ) as ActionButton | undefined) ?? null;

    const handles = [
      reactiveUtils.on(
        () => view.popup,
        "trigger-action",
        (triggerEvent) => {
          if (triggerEvent.action.id !== SAVE_ACTION_ID) return;

          const institution = toAreaInstitution(
            view.popup?.selectedFeature?.attributes,
          );
          if (institution) {
            savedRef.current.toggleSave(institution);
          }
        },
      ),
      reactiveUtils.watch(
        () => view.popup?.selectedFeature,
        () =>
          updateSaveButton(
            saveActionRef.current,
            view,
            savedRef.current.isSaved,
          ),
      ),
    ];

    return () => handles.forEach((handle) => handle.remove());
  }, [view, collegesLayerRef]);

  useEffect(() => {
    if (!view) return;
    updateSaveButton(saveActionRef.current, view, isSaved);
  }, [view, isSaved]);
}
