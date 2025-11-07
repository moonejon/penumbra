"use client";

import { BookType } from "@/shared.types";
import { FC, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Box, Button, Stack, Typography, Chip } from "@mui/material";

type ConstellationProps = {
  books: BookType[];
  onBookSelect: (book: BookType) => void;
};

type Mood = {
  id: string;
  label: string;
  color: string;
  keywords: string[];
};

const moods: Mood[] = [
  {
    id: "cozy",
    label: "Cozy",
    color: "#d4a574",
    keywords: ["comfort", "gentle", "warm", "slice of life"],
  },
  {
    id: "adventurous",
    label: "Adventurous",
    color: "#ff6f00",
    keywords: ["action", "adventure", "thriller", "epic"],
  },
  {
    id: "mysterious",
    label: "Mysterious",
    color: "#7b68ee",
    keywords: ["mystery", "suspense", "crime", "detective"],
  },
  {
    id: "contemplative",
    label: "Contemplative",
    color: "#84cc16",
    keywords: ["philosophy", "literary", "poetry", "essays"],
  },
  {
    id: "fantastical",
    label: "Fantastical",
    color: "#c770f0",
    keywords: ["fantasy", "magic", "sci-fi", "science fiction"],
  },
];

const Constellation: FC<ConstellationProps> = ({ books, onBookSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [hoveredBook, setHoveredBook] = useState<BookType | null>(null);

  useEffect(() => {
    if (!svgRef.current || books.length === 0) return;

    const width = 1200;
    const height = 800;

    // Clear previous render
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Create gradient definitions
    const defs = svg.append("defs");
    moods.forEach((mood) => {
      const gradient = defs
        .append("radialGradient")
        .attr("id", `gradient-${mood.id}`)
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", mood.color)
        .attr("stop-opacity", 0.3);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", mood.color)
        .attr("stop-opacity", 0);
    });

    // Assign moods to books based on subjects
    const booksWithMoods = books.map((book) => {
      const subjects = book.subjects.join(" ").toLowerCase();
      let assignedMood = moods[0]; // Default to cozy

      for (const mood of moods) {
        if (mood.keywords.some((keyword) => subjects.includes(keyword))) {
          assignedMood = mood;
          break;
        }
      }

      return { ...book, mood: assignedMood };
    });

    // Filter by selected mood if any
    const filteredBooks = selectedMood
      ? booksWithMoods.filter((b) => b.mood.id === selectedMood)
      : booksWithMoods;

    // Create nodes
    const nodes = filteredBooks.map((book, i) => ({
      book,
      x: Math.random() * width,
      y: Math.random() * height,
    }));

    // Create force simulation
    const simulation = d3
      .forceSimulation(nodes as any)
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(35))
      .force(
        "x",
        d3.forceX(width / 2).strength(0.05)
      )
      .force(
        "y",
        d3.forceY(height / 2).strength(0.05)
      );

    // Create links between books by same author
    const links: any[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const hasCommonAuthor = nodes[i].book.authors.some((author) =>
          nodes[j].book.authors.includes(author)
        );
        if (hasCommonAuthor) {
          links.push({ source: nodes[i], target: nodes[j] });
        }
      }
    }

    // Draw connections
    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", (d: any) => d.source.book.mood.color)
      .attr("stroke-opacity", 0.2)
      .attr("stroke-width", 1);

    // Draw mood zones (background circles)
    const moodZones = svg.append("g").attr("class", "mood-zones");

    moods.forEach((mood) => {
      const moodBooks = nodes.filter((n) => n.book.mood.id === mood.id);
      if (moodBooks.length === 0) return;

      const centerX =
        d3.mean(moodBooks, (d) => d.x as number) || width / 2;
      const centerY =
        d3.mean(moodBooks, (d) => d.y as number) || height / 2;

      moodZones
        .append("circle")
        .attr("cx", centerX)
        .attr("cy", centerY)
        .attr("r", 150)
        .attr("fill", `url(#gradient-${mood.id})`)
        .attr("opacity", selectedMood === null || selectedMood === mood.id ? 1 : 0.3);
    });

    // Draw nodes
    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .style("cursor", "pointer")
      .on("click", (event, d: any) => {
        onBookSelect(d.book);
      })
      .on("mouseenter", (event, d: any) => {
        setHoveredBook(d.book);
      })
      .on("mouseleave", () => {
        setHoveredBook(null);
      });

    // Book circles
    node
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d: any) => d.book.mood.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("opacity", 0.8);

    // Glow effect
    node
      .append("circle")
      .attr("r", 25)
      .attr("fill", "none")
      .attr("stroke", (d: any) => d.book.mood.color)
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .attr("class", "glow");

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Hover effects
    node
      .on("mouseenter", function () {
        d3.select(this).select(".glow").attr("opacity", 0.6);
        d3.select(this).select("circle:first-child").attr("r", 25);
      })
      .on("mouseleave", function () {
        d3.select(this).select(".glow").attr("opacity", 0);
        d3.select(this).select("circle:first-child").attr("r", 20);
      });

    return () => {
      simulation.stop();
    };
  }, [books, selectedMood, onBookSelect]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        background: "#2d2d2d",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Mood Selector */}
      <Box
        sx={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          background: "rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: "24px",
          padding: "12px 20px",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="caption" sx={{ color: "#fff", mr: 1 }}>
            Mood:
          </Typography>
          <Chip
            label="All"
            onClick={() => setSelectedMood(null)}
            sx={{
              bgcolor: selectedMood === null ? "#ffb84d" : "transparent",
              color: "#fff",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              "&:hover": { bgcolor: "rgba(255, 184, 77, 0.3)" },
            }}
          />
          {moods.map((mood) => (
            <Chip
              key={mood.id}
              label={mood.label}
              onClick={() => setSelectedMood(mood.id)}
              sx={{
                bgcolor: selectedMood === mood.id ? mood.color : "transparent",
                color: "#fff",
                border: `1px solid ${mood.color}`,
                "&:hover": { bgcolor: `${mood.color}40` },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Book Info Hover */}
      {hoveredBook && (
        <Box
          sx={{
            position: "absolute",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            padding: "16px 24px",
            maxWidth: "400px",
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", mb: 0.5 }}>
            {hoveredBook.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "#aaa" }}>
            {hoveredBook.authors.join(", ")}
          </Typography>
        </Box>
      )}

      {/* Constellation Canvas */}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit
      >
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg ref={svgRef} style={{ maxWidth: "100%", maxHeight: "100%" }} />
        </TransformComponent>
      </TransformWrapper>

      {/* Instructions */}
      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          bottom: 20,
          right: 20,
          color: "rgba(255, 255, 255, 0.5)",
        }}
      >
        Scroll to zoom • Drag to pan • Click book to view details
      </Typography>
    </Box>
  );
};

export default Constellation;
