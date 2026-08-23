"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRequestContent } from "@/features/browse-detail/model/useRequestContent";
import { useTmdbRecommendations } from "@/features/browse-detail/model/useTmdbRecommendations";
import { API_HOST_IP } from "@/shared/config/env";
import { getToken } from "@/shared/lib/auth";
import type { TmdbMovieDetail } from "@/features/browse-detail/model/getTmdbMovieDetail";

export function useBrowseDetail(movie: TmdbMovieDetail) {
  const [isMuted, setIsMuted] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [alreadyRequested, setAlreadyRequested] = useState<boolean | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { message, setMessage, status, submit, reset } = useRequestContent();

  const year = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const { items: recommendations } = useTmdbRecommendations(movie.id, movie.type);

  useEffect(() => {
    setHasToken(!!getToken());
  }, []);

  useEffect(() => {
    const checkExists = async () => {
      try {
        const token = getToken();
        const contentType = movie.type === "tv" ? 2 : 1;
        const res = await fetch(
          `${API_HOST_IP}/suggested-content-reports/exists/${movie.id}/${contentType}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (res.ok) {
          const exists = await res.json();
          setAlreadyRequested(exists === true);
        }
      } catch {
        setAlreadyRequested(false);
      }
    };
    void checkExists();
  }, [movie.id, movie.type]);

  useEffect(() => {
    if (showModal && status === "idle") {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [showModal, status]);

  const toggleMuted = useCallback(() => setIsMuted((prev) => !prev), []);

  const openModal = useCallback(() => {
    reset();
    setShowModal(true);
  }, [reset]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    reset();
  }, [reset]);

  const handleSubmit = useCallback(async () => {
    await submit(movie.id, movie.type);
    setTimeout(() => {
      setShowModal(false);
      reset();
    }, 2000);
  }, [submit, movie.id, movie.type, reset]);

  return {
    isMuted,
    toggleMuted,
    showModal,
    hasToken,
    alreadyRequested,
    textareaRef,
    message,
    setMessage,
    status,
    year,
    recommendations,
    openModal,
    closeModal,
    handleSubmit,
  };
}
